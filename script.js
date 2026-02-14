const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

const coursePriceMap = {
  "브랜딩 기초 4주": 220000,
  "패키지 디자인 실전": 270000,
  "포트폴리오 제작 코칭": 320000
};

const enrollForm = document.querySelector("#enroll-form");
const courseSelect = document.querySelector("#course");
const amountInput = document.querySelector("#amount");
const orderIdInput = document.querySelector("#orderId");
const summaryCourse = document.querySelector("#summary-course");
const summaryAmount = document.querySelector("#summary-amount");
const payloadPreview = document.querySelector("#payload-preview");
const classSelectButtons = document.querySelectorAll(".class-select");

const formatPrice = (value) => new Intl.NumberFormat("ko-KR").format(value);

function makeOrderId() {
  return `ATELIER-${Date.now()}`;
}

function updateCheckoutPreview() {
  if (!courseSelect || !amountInput) return;

  const selectedCourse = courseSelect.value;
  const amount = coursePriceMap[selectedCourse] || 0;

  amountInput.value = String(amount);
  summaryCourse.textContent = selectedCourse
    ? `선택 클래스: ${selectedCourse}`
    : "클래스를 선택하면 금액이 표시됩니다.";
  summaryAmount.textContent = `결제 금액: ${formatPrice(amount)}원`;

  const selectedPayment = enrollForm?.querySelector("input[name='paymentMethod']:checked")?.value || "card";

  const payload = {
    orderId: orderIdInput?.value || "",
    course: selectedCourse,
    amount,
    paymentMethod: selectedPayment,
    customer: {
      name: enrollForm?.name?.value || "",
      email: enrollForm?.email?.value || "",
      phone: enrollForm?.phone?.value || ""
    }
  };

  payloadPreview.textContent = JSON.stringify(payload, null, 2);
}

if (courseSelect) {
  courseSelect.addEventListener("change", updateCheckoutPreview);
}

if (enrollForm) {
  orderIdInput.value = makeOrderId();

  enrollForm.addEventListener("input", updateCheckoutPreview);

  enrollForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!enrollForm.checkValidity()) {
      enrollForm.reportValidity();
      return;
    }

    orderIdInput.value = makeOrderId();
    updateCheckoutPreview();

    // 실제 연동 시:
    // 1) /api/enroll 로 신청 데이터 저장
    // 2) 서버에서 PG 결제창 호출용 키/토큰 생성
    // 3) 클라이언트에서 SDK로 결제창 실행
    alert("신청 데이터가 준비되었습니다. 다음 단계에서 결제 SDK를 연결하세요.");
  });
}

classSelectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetCourse = button.dataset.course || "";
    if (!courseSelect) return;

    courseSelect.value = targetCourse;
    updateCheckoutPreview();

    const enrollSection = document.querySelector("#enroll");
    enrollSection?.scrollIntoView({ behavior: "smooth" });
  });
});

updateCheckoutPreview();
