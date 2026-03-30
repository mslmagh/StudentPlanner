FROM python:3.11-slim

WORKDIR /app

# 1. Önce kütüphaneleri "root" yetkisiyle kuruyoruz (İzin hatasını giderir)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2. Hugging Face'in zorunlu kıldığı standart 1000 numaralı kullanıcıyı (user) oluşturuyoruz
RUN useradd -m -u 1000 user
USER user

# 3. Çalışma klasörümüzü bu yeni kullanıcıya göre ayarlıyoruz
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH
WORKDIR $HOME/app

# 4. Kendi dosyalarımızı bu yeni kullanıcının sahipliğinde içeri kopyalıyoruz
COPY --chown=user . $HOME/app

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
