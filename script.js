const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
document.querySelectorAll('.main-nav a').forEach((link) => {
  const href = (link.getAttribute('href') || '').toLowerCase();
  if (href === currentPage) {
    link.classList.add('active');
  }
});

const defaultCourses = [
  {
    name: '브랜딩 기초 4주',
    price: 220000,
    desc: '브랜드 콘셉트 정의부터 로고/톤앤매너 설계까지 빠르게 완성합니다.',
    tag: 'Starter'
  },
  {
    name: '패키지 디자인 실전',
    price: 270000,
    desc: '시장 분석, 시안 제작, 목업 완성까지 실무 흐름으로 진행합니다.',
    tag: 'Pro'
  },
  {
    name: '포트폴리오 제작 코칭',
    price: 320000,
    desc: '수강생 작업 리뷰와 취업/프리랜서용 포트폴리오 정리를 돕습니다.',
    tag: 'Career'
  }
];

const formatPrice = (value) => new Intl.NumberFormat('ko-KR').format(value);

function makeOrderId() {
  return `ATELIER-${Date.now()}`;
}

async function loadCourses() {
  try {
    const response = await fetch('data/courses.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch courses');
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return defaultCourses;
    return data;
  } catch (error) {
    return defaultCourses;
  }
}

function renderClassCards(courses) {
  const classesList = document.querySelector('#classes-list');
  if (!classesList) return;

  classesList.innerHTML = courses
    .map(
      (course) => `
        <article class="card reveal">
          <p class="card-tag">${course.tag || 'Class'}</p>
          <h3>${course.name}</h3>
          <p>${course.desc}</p>
          <p class="price">${formatPrice(course.price)}원</p>
          <button class="btn btn-small class-select" data-course="${course.name}">이 클래스로 신청</button>
        </article>
      `
    )
    .join('');
}

function populateEnrollSelect(courses) {
  const courseSelect = document.querySelector('#course');
  if (!courseSelect) return;

  const placeholder = '<option value="">선택하세요</option>';
  const options = courses
    .map((course) => `<option value="${course.name}">${course.name} (${formatPrice(course.price)}원)</option>`)
    .join('');

  courseSelect.innerHTML = `${placeholder}${options}`;
}

function setSelectedCourseFromUrl() {
  const courseSelect = document.querySelector('#course');
  if (!courseSelect) return;

  const params = new URLSearchParams(window.location.search);
  const requestedCourse = params.get('course');
  if (!requestedCourse) return;

  const option = Array.from(courseSelect.options).find((item) => item.value === requestedCourse);
  if (option) {
    courseSelect.value = requestedCourse;
  }
}

function updateCheckoutPreview(coursePriceMap) {
  const enrollForm = document.querySelector('#enroll-form');
  const courseSelect = document.querySelector('#course');
  const amountInput = document.querySelector('#amount');
  const orderIdInput = document.querySelector('#orderId');
  const summaryCourse = document.querySelector('#summary-course');
  const summaryAmount = document.querySelector('#summary-amount');
  const payloadPreview = document.querySelector('#payload-preview');

  if (!courseSelect || !amountInput || !summaryCourse || !summaryAmount || !payloadPreview) return;

  const selectedCourse = courseSelect.value;
  const amount = coursePriceMap[selectedCourse] || 0;
  amountInput.value = String(amount);

  summaryCourse.textContent = selectedCourse
    ? `선택 클래스: ${selectedCourse}`
    : '클래스를 선택하면 금액이 표시됩니다.';
  summaryAmount.textContent = `결제 금액: ${formatPrice(amount)}원`;

  const selectedPayment =
    enrollForm?.querySelector("input[name='paymentMethod']:checked")?.value || 'card';

  const payload = {
    orderId: orderIdInput?.value || '',
    course: selectedCourse,
    amount,
    paymentMethod: selectedPayment,
    customer: {
      name: enrollForm?.querySelector("input[name='name']")?.value || '',
      email: enrollForm?.querySelector("input[name='email']")?.value || '',
      phone: enrollForm?.querySelector("input[name='phone']")?.value || ''
    }
  };

  payloadPreview.textContent = JSON.stringify(payload, null, 2);
}

function setupEnrollForm(coursePriceMap) {
  const enrollForm = document.querySelector('#enroll-form');
  const courseSelect = document.querySelector('#course');
  const orderIdInput = document.querySelector('#orderId');

  if (!enrollForm || !courseSelect || !orderIdInput) return;

  orderIdInput.value = makeOrderId();

  const refresh = () => updateCheckoutPreview(coursePriceMap);

  courseSelect.addEventListener('change', refresh);
  enrollForm.addEventListener('input', refresh);

  enrollForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!enrollForm.checkValidity()) {
      enrollForm.reportValidity();
      return;
    }

    orderIdInput.value = makeOrderId();
    refresh();
    alert('신청 데이터가 준비되었습니다. 다음 단계에서 결제 SDK를 연결하세요.');
  });

  refresh();
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('.class-select');
  if (!button) return;

  const targetCourse = button.dataset.course || '';
  if (!targetCourse) return;

  const courseSelect = document.querySelector('#course');

  if (courseSelect) {
    courseSelect.value = targetCourse;
    courseSelect.dispatchEvent(new Event('change'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  window.location.href = `enroll.html?course=${encodeURIComponent(targetCourse)}`;
});

(async function init() {
  const courses = await loadCourses();
  const coursePriceMap = Object.fromEntries(courses.map((course) => [course.name, Number(course.price) || 0]));

  renderClassCards(courses);
  populateEnrollSelect(courses);
  setSelectedCourseFromUrl();
  setupEnrollForm(coursePriceMap);
  updateCheckoutPreview(coursePriceMap);
})();

