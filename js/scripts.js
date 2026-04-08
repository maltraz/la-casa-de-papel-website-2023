document.addEventListener('DOMContentLoaded', () => {
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) return;

        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink');
        } else {
            navbarCollapsible.classList.add('navbar-shrink');
        }
    };

    navbarShrink();

    document.addEventListener('scroll', navbarShrink);

    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav && typeof bootstrap !== 'undefined') {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    }

    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(document.querySelectorAll('#navbarResponsive .nav-link'));
    responsiveNavItems.forEach(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    const form = document.getElementById('registrationForm');
    const formOutput = document.getElementById('form-output');
    const showSubmissionsBtn = document.getElementById('show-submissions');
    const loadDataBtn = document.getElementById('load-data');

    if (!form || !formOutput || !showSubmissionsBtn || !loadDataBtn) return;

    const showMessage = (text, type = 'success') => {
        const el = document.createElement('div');
        el.className = `alert alert-${type} mt-3`;
        el.textContent = text;

        const old = form.querySelector('.alert');
        if (old) old.remove();

        form.appendChild(el);
        setTimeout(() => el.remove(), 2500);
    };

    const getSubmissions = () => JSON.parse(localStorage.getItem('formSubmissions')) || [];
    const setSubmissions = (arr) => localStorage.setItem('formSubmissions', JSON.stringify(arr));

    const validateFormObject = (obj) => {
        if (!obj.imie || obj.imie.trim().length < 2) return 'Podaj poprawne imię.';
        if (!obj.nazwisko || obj.nazwisko.trim().length < 2) return 'Podaj poprawne nazwisko.';
        if (!obj.wiek || Number(obj.wiek) < 9 || Number(obj.wiek) > 99) return 'Wiek musi być w zakresie 9–99.';
        if (!obj.panstwo) return 'Wybierz państwo.';
        if (!obj.kierunkowy) return 'Wybierz kierunkowy.';
        if (!obj.tel || !/^\d{3}-\d{3}-\d{3}$/.test(obj.tel)) return 'Telefon musi być w formacie XXX-XXX-XXX.';
        if (!obj.email || !/^\S+@\S+\.\S+$/.test(obj.email)) return 'Podaj poprawny e-mail.';
        return null;
    };

    const renderSubmissions = () => {
        const submissions = getSubmissions();
        formOutput.innerHTML = '';

        if (submissions.length === 0) {
            formOutput.innerHTML = `<div class="alert alert-secondary">Brak zapisanych zgłoszeń.</div>`;
            return;
        }

        submissions.forEach((s, index) => {
            const card = document.createElement('div');
            card.className = 'submission-card';

            const name = `${s.imie ?? ''} ${s.nazwisko ?? ''}`.trim();
            const age = s.wiek ?? '';
            const email = s.email ?? '';
            const phone = `${s.kierunkowy ?? ''} ${s.tel ?? ''}`.trim();
            const country = s.panstwo ?? '';

            card.innerHTML = `
        <div><strong>${name}</strong>${age ? ` (${age})` : ''}</div>
        <div>Email: ${email}</div>
        <div>Tel: ${phone}</div>
        <div>Państwo: ${country}</div>
        <div class="submission-buttons mt-2">
          <button class="btn btn-warning btn-sm edit-btn" data-index="${index}">Edytuj</button>
          <button class="btn btn-danger btn-sm delete-btn" data-index="${index}">Usuń</button>
        </div>
      `;

            formOutput.appendChild(card);
        });
    };

    formOutput.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const index = Number(btn.dataset.index);
        const submissions = getSubmissions();

        if (Number.isNaN(index) || !submissions[index]) return;

        if (btn.classList.contains('delete-btn')) {
            submissions.splice(index, 1);
            setSubmissions(submissions);
            renderSubmissions();
            showMessage('Usunięto zgłoszenie.', 'warning');
            return;
        }

        if (btn.classList.contains('edit-btn')) {
            const s = submissions[index];

            Object.keys(s).forEach((key) => {
                const field = form.elements[key];
                if (field) field.value = s[key];
            });

            submissions.splice(index, 1);
            setSubmissions(submissions);
            renderSubmissions();
            showMessage('Wczytano dane do edycji. Zapisz formularz ponownie.', 'info');
        }
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const formObject = {};
        formData.forEach((value, key) => (formObject[key] = value));

        const errorMsg = validateFormObject(formObject);
        if (errorMsg) {
            showMessage(errorMsg, 'danger');
            return;
        }

        const submissions = getSubmissions();
        submissions.push(formObject);
        setSubmissions(submissions);

        form.reset();
        showMessage('Zapisano zgłoszenie', 'success');
    });

    showSubmissionsBtn.addEventListener('click', renderSubmissions);

    loadDataBtn.addEventListener('click', () => {
        const ok = confirm('To nadpisze wszystkie zgłoszenia danymi z pliku. Kontynuować?');
        if (!ok) return;

        fetch('assets/package.json')
            .then((response) => response.json())
            .then((data) => {
                if (!Array.isArray(data)) {
                    showMessage('Plik z danymi ma zły format.', 'danger');
                    return;
                }

                setSubmissions(data);

                renderSubmissions();
                showMessage('Zastąpiono dane danymi z pliku', 'success');
            })
            .catch((error) => {
                console.error('Błąd podczas wczytywania danych:', error);
                showMessage('Nie udało się wczytać danych.', 'danger');
            });
    });

    const actors = document.querySelectorAll('.actor');
    const showMoreBtn = document.getElementById('show-more-btn');
    let visibleCount = 3;

    const showActors = () => {
        for (let i = 0; i < visibleCount; i++) {
            if (actors[i]) actors[i].style.display = 'flex';
        }
        if (showMoreBtn && visibleCount >= actors.length) {
            showMoreBtn.style.display = 'none';
        }
    };

    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            visibleCount += 3;
            showActors();
        });
    }

    showActors();
});