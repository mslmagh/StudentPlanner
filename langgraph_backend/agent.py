import os
import uuid
from typing import Annotated, Any, Dict, List, Optional
from datetime import datetime

from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from tools import get_all_tools

load_dotenv(override=True)

# ─── LangSmith Entegrasyonu ──────────────────────────────────────────────────
# LangSmith, LangGraph'ın her adımını (worker, evaluator, tool calls) izler.
# Aktif etmek için .env dosyasında:
#   LANGCHAIN_TRACING_V2=true
#   LANGCHAIN_API_KEY=<langsmith-api-key>
#   LANGCHAIN_PROJECT=StudentPlanner-LangGraph
if os.getenv("LANGCHAIN_TRACING_V2", "").lower() == "true":
    os.environ.setdefault("LANGCHAIN_PROJECT", "StudentPlanner-LangGraph")
    os.environ.setdefault("LANGCHAIN_ENDPOINT", "https://api.smith.langchain.com")


# ─── State: Kursta State(TypedDict) olarak tanımlanmıştı ─────────────────────
class State(TypedDict):
    messages: Annotated[List[Any], add_messages]
    success_criteria: str
    feedback_on_work: Optional[str]
    success_criteria_met: bool
    user_input_needed: bool


# ─── Evaluator structured output (kursta EvaluatorOutput) ─────────────────────
class EvaluatorOutput(BaseModel):
    feedback: str = Field(description="Feedback on the assistant's response")
    success_criteria_met: bool = Field(description="Whether the success criteria have been met")
    user_input_needed: bool = Field(
        description="True if more input is needed from the user, or clarifications, or the assistant is stuck"
    )


# ─── LLM oluşturucu ──────────────────────────────────────────────────────────
# Kursta gpt-4o-mini kullanılıyordu. Biz OpenRouter üzerinden çalışıyoruz.
# OpenRouter, OpenAI-uyumlu API → ChatOpenAI ile direkt çalışır.

def _build_llm() -> ChatOpenAI:
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    if openrouter_key:
        model = os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-chat")
        return ChatOpenAI(
            model=model,
            openai_api_key=openrouter_key,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.7,
        )

    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if gemini_key:
        model = os.getenv("GEMINI_MODEL", "gemini/gemini-2.5-flash")
        return ChatOpenAI(
            model=model,
            openai_api_key=gemini_key,
            openai_api_base="https://generativelanguage.googleapis.com/v1beta/openai/",
            temperature=0.7,
        )

    raise ValueError(
        "LLM API anahtarı bulunamadı. "
        "OPENROUTER_API_KEY veya GEMINI_API_KEY tanımlı olmalı."
    )


# ─── StudyAssistant (kursta: Sidekick) ───────────────────────────────────────
class StudyAssistant:
    """
    LangGraph tabanlı çalışma asistanı.
    Kursta Sidekick sınıfının yaptığı her şeyi yapar:
      - Worker node: görev üzerinde çalışır, araç kullanır
      - Evaluator node: çıktıyı değerlendirir, gerekirse geri gönderir
      - MemorySaver: konuşma geçmişini thread bazlı saklar
    """

    def __init__(self):
        self.tools = get_all_tools()
        self.memory = MemorySaver()
        self.session_id = str(uuid.uuid4())

        # Worker LLM — araçlar bağlı (kursta: worker_llm.bind_tools)
        worker_llm = _build_llm()
        self.worker_llm_with_tools = worker_llm.bind_tools(self.tools)

        # Evaluator LLM — structured output (kursta: with_structured_output)
        evaluator_llm = _build_llm()
        self.evaluator_llm_with_output = evaluator_llm.with_structured_output(EvaluatorOutput)

        # Graph'ı inşa et
        self._build_graph()

    # ─── Worker Node (kursta: def worker) ─────────────────────────────────
    def worker(self, state: State) -> Dict[str, Any]:
        system_message = f"""Sen StudentPlanner uygulamasının çalışma asistanısın.
Öğrencilere ders partneri bulmada, çalışma planı oluşturmada ve akademik tavsiye vermede yardımcı olursun.

Kullanabileceğin araçlar:
- search_partners: Veritabanında partner arama (ders, seviye, zaman, çalışma türü ile filtrele)
- list_courses: Mevcut derslerin listesini getir
- get_partner_stats: Belirli bir dersin partner istatistiklerini göster

Yanıtlarını Türkçe ver. Somut ve yardımcı ol.
Bugünün tarihi: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

Başarı kriterleri: {state["success_criteria"]}

Görevin bitiğinde direkt cevabını ver.
Bir sorun varsa veya ek bilgi gerekiyorsa, açıkça sor."""

        if state.get("feedback_on_work"):
            system_message += f"""

Daha önce verdiğin cevap reddedildi. Geri bildirim:
{state["feedback_on_work"]}
Bu geri bildirimi dikkate alarak tekrar dene."""

        messages = list(state["messages"])
        found_system = False
        for msg in messages:
            if isinstance(msg, SystemMessage):
                msg.content = system_message
                found_system = True

        if not found_system:
            messages = [SystemMessage(content=system_message)] + messages

        response = self.worker_llm_with_tools.invoke(messages)
        return {"messages": [response]}

    # ─── Worker Router (kursta: def worker_router) ────────────────────────
    def worker_router(self, state: State) -> str:
        last_message = state["messages"][-1]
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        return "evaluator"

    # ─── Evaluator Node (kursta: def evaluator) ──────────────────────────
    def _format_conversation(self, messages: List[Any]) -> str:
        conversation = "Konuşma geçmişi:\n\n"
        for msg in messages:
            if isinstance(msg, HumanMessage):
                conversation += f"Kullanıcı: {msg.content}\n"
            elif isinstance(msg, AIMessage):
                text = msg.content or "[Araç kullanımı]"
                conversation += f"Asistan: {text}\n"
        return conversation

    def evaluator(self, state: State) -> State:
        last_response = state["messages"][-1].content

        system_message = """Sen bir değerlendiricisin. Asistanın verdiği cevabın kalitesini belirlersin.
Cevabın başarı kriterlerini karşılayıp karşılamadığını, kullanıcıdan ek bilgi gerekip gerekmediğini değerlendir.
Asistana yapıcı geri bildirim ver."""

        user_message = f"""Asistan ile kullanıcı arasındaki konuşma:
{self._format_conversation(state["messages"])}

Başarı kriterleri: {state["success_criteria"]}

Asistanın son cevabı: {last_response}

Bu cevap başarı kriterlerini karşılıyor mu? Kullanıcıdan ek bilgi gerekiyor mu?
Asistan bir dosya yazdığını veya araç kullandığını söylüyorsa, bunu kabul et.
Ama cevap yetersizse veya yanlışsa reddet."""

        if state.get("feedback_on_work"):
            user_message += f"\nÖnceki geri bildirim: {state['feedback_on_work']}"
            user_message += "\nAsistan aynı hataları tekrar ediyorsa, kullanıcı girdisi gerektiğini belirt."

        evaluator_messages = [
            SystemMessage(content=system_message),
            HumanMessage(content=user_message),
        ]

        eval_result = self.evaluator_llm_with_output.invoke(evaluator_messages)

        return {
            "messages": [
                {"role": "assistant", "content": f"Değerlendirici: {eval_result.feedback}"}
            ],
            "feedback_on_work": eval_result.feedback,
            "success_criteria_met": eval_result.success_criteria_met,
            "user_input_needed": eval_result.user_input_needed,
        }

    # ─── Evaluator Router (kursta: def route_based_on_evaluation) ─────────
    def route_based_on_evaluation(self, state: State) -> str:
        if state["success_criteria_met"] or state["user_input_needed"]:
            return "END"
        return "worker"

    def _build_graph(self):
        graph_builder = StateGraph(State)

        
        graph_builder.add_node("worker", self.worker)
        graph_builder.add_node("tools", ToolNode(tools=self.tools))
        graph_builder.add_node("evaluator", self.evaluator)

    
        graph_builder.add_conditional_edges(
            "worker",
            self.worker_router,
            {"tools": "tools", "evaluator": "evaluator"},
        )
        graph_builder.add_edge("tools", "worker")
        graph_builder.add_conditional_edges(
            "evaluator",
            self.route_based_on_evaluation,
            {"worker": "worker", "END": END},
        )
        graph_builder.add_edge(START, "worker")

        self.graph = graph_builder.compile(checkpointer=self.memory)

    async def chat(self, message: str, thread_id: str | None = None) -> dict:
        config = {"configurable": {"thread_id": thread_id or self.session_id}}

        state = {
            "messages": [HumanMessage(content=message)],
            "success_criteria": "Cevap açık, doğru ve kullanıcının sorusuna yönelik olmalı. Türkçe yanıt ver.",
            "feedback_on_work": None,
            "success_criteria_met": False,
            "user_input_needed": False,
        }

        result = await self.graph.ainvoke(state, config=config)

        # Son asistan mesajını bul (evaluator feedback'inden önceki)
        assistant_reply = ""
        for msg in reversed(result["messages"]):
            if isinstance(msg, AIMessage) and msg.content and not msg.content.startswith("Değerlendirici:"):
                assistant_reply = msg.content
                break
            if isinstance(msg, dict) and msg.get("role") == "assistant" and not msg.get("content", "").startswith("Değerlendirici:"):
                assistant_reply = msg["content"]
                break

        if not assistant_reply:
            last = result["messages"][-1]
            assistant_reply = last.content if hasattr(last, "content") else str(last)

        return {
            "reply": assistant_reply,
            "thread_id": thread_id or self.session_id,
            "success": result.get("success_criteria_met", False),
        }
