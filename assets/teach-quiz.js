document.querySelectorAll("[data-quiz]").forEach((quiz) => {
  const feedback = quiz.querySelector("[data-feedback]");
  quiz.querySelectorAll("button[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      quiz.querySelectorAll("button[data-answer]").forEach((item) => {
        item.classList.remove("correct", "wrong");
      });
      const isCorrect = button.dataset.answer === quiz.dataset.correct;
      button.classList.add(isCorrect ? "correct" : "wrong");
      feedback.textContent = isCorrect
        ? "Correct. The cue map makes the editorial decision."
        : "Close. That part checks or executes a decision made elsewhere.";
    });
  });
});
