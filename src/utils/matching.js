const timeOrder = ['Morning', 'Afternoon', 'Evening', 'Night']

function isSimilarTime(requestedTime, candidateTime) {
  const requestedIndex = timeOrder.indexOf(requestedTime)
  const candidateIndex = timeOrder.indexOf(candidateTime)

  if (requestedIndex === -1 || candidateIndex === -1) {
    return requestedTime === candidateTime
  }

  return Math.abs(requestedIndex - candidateIndex) <= 1
}

export function findMatches(request, candidates) {
  return candidates.filter((candidate) => {
    const sameCourse = candidate.course.toLowerCase() === request.course.toLowerCase()
    const sameLevel = candidate.level === request.level
    const similarTime = isSimilarTime(request.preferredTime, candidate.time)

    return sameCourse && sameLevel && similarTime
  })
}