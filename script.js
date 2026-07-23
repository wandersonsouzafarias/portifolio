const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");

menuToggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

  revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelectorAll(".faq-list details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-list details").forEach((other) => {
      if (other !== item) other.removeAttribute("open");
    });
  });
});

const dialog = document.querySelector("#case-dialog");
const caseFields = {
  title: document.querySelector("#case-title"),
  type: document.querySelector("#case-type"),
  problem: document.querySelector("#case-problem"),
  solution: document.querySelector("#case-solution"),
  result: document.querySelector("#case-result")
};

document.querySelectorAll(".case-button").forEach((button) => {
  button.addEventListener("click", () => {
    Object.keys(caseFields).forEach((key) => {
      caseFields[key].textContent = button.dataset[key];
    });
    dialog.showModal();
  });
});

dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const box = dialog.getBoundingClientRect();
  const outside = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  if (outside) dialog.close();
});
dialog.querySelector('a[href="#orcamento"]').addEventListener("click", () => dialog.close());

const wizard = document.querySelector("#quote-wizard");
const steps = [...wizard.querySelectorAll(".wizard-step")];
const nextButton = document.querySelector("#next-step");
const previousButton = document.querySelector("#prev-step");
const sendButton = document.querySelector("#send-quote");
const stepLabel = document.querySelector("#step-label");
const progressBar = document.querySelector("#progress-bar");
const wizardError = document.querySelector("#wizard-error");
let currentStep = 0;

function showStep(index) {
  currentStep = index;
  steps.forEach((step, stepIndex) => step.classList.toggle("active", stepIndex === index));
  stepLabel.textContent = `Etapa ${index + 1} de ${steps.length}`;
  progressBar.style.width = `${((index + 1) / steps.length) * 100}%`;
  previousButton.hidden = index === 0;
  nextButton.hidden = index === steps.length - 1;
  sendButton.hidden = index !== steps.length - 1;
  wizardError.textContent = "";
}

function currentStepIsValid() {
  const step = steps[currentStep];
  const radio = step.querySelector('input[type="radio"]');
  if (radio && !step.querySelector('input[type="radio"]:checked')) {
    wizardError.textContent = "Escolha uma opção para continuar.";
    return false;
  }
  return true;
}

nextButton.addEventListener("click", () => {
  if (currentStepIsValid() && currentStep < steps.length - 1) showStep(currentStep + 1);
});

previousButton.addEventListener("click", () => {
  if (currentStep > 0) showStep(currentStep - 1);
});

wizard.querySelectorAll('input[type="radio"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    wizardError.textContent = "";
  });
});

document.querySelectorAll(".select-plan").forEach((button) => {
  button.addEventListener("click", () => {
    const option = wizard.querySelector(`input[name="projeto"][value="${button.dataset.plan}"]`);
    if (option) option.checked = true;
    showStep(0);
    document.querySelector("#orcamento").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
});

wizard.addEventListener("submit", (event) => {
  event.preventDefault();
  const nameInput = wizard.elements.nome;
  if (!nameInput.value.trim()) {
    wizardError.textContent = "Digite seu nome para preparar a mensagem.";
    nameInput.focus();
    return;
  }

  const data = new FormData(wizard);
  const details = data.get("detalhes")?.trim();
  const message = [
    `Olá, Wanderson! Meu nome é ${data.get("nome").trim()}.`,
    "",
    "Preenchi o briefing no seu portfólio:",
    `• Projeto: ${data.get("projeto")}`,
    `• Objetivo: ${data.get("objetivo")}`,
    `• Prazo: ${data.get("prazo")}`,
    details ? `• Sobre a ideia: ${details}` : "",
    "",
    "Gostaria de conversar sobre os próximos passos."
  ].filter(Boolean).join("\n");

  window.open(`https://wa.me/5531987167231?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});

showStep(0);
