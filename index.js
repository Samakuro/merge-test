// Client-side glue: fetch stats/features and handle contact form
document.addEventListener('DOMContentLoaded', () => {
	const statsEls = document.querySelectorAll('.stats .stat');
	const featuresEl = document.getElementById('features');
	const form = document.getElementById('contact-form');
	const msgBox = document.getElementById('contact-msg');

	// fetch stats
	fetch('/api/stats')
		.then(r => r.json())
		.then(data => {
			if (data && data.stats) {
				// update first three stat boxes if present
				const s = data.stats;
				if (statsEls[0]) statsEls[0].innerHTML = `เร็ว • <span style="font-weight:600">${s.loadTime}</span>`;
				if (statsEls[1]) statsEls[1].innerHTML = `ตอบสนอง • <span style="font-weight:600">${s.responsiveness}</span>`;
				if (statsEls[2]) statsEls[2].innerHTML = `รองรับ • <span style="font-weight:600">${s.support}</span>`;
			}
		})
		.catch(() => {});

	// fetch dynamic features and replace contents
	fetch('/api/features')
		.then(r => r.json())
		.then(data => {
			if (data && data.features && featuresEl) {
				featuresEl.innerHTML = '';
				data.features.forEach(f => {
					const div = document.createElement('div');
					div.className = 'feature';
					div.innerHTML = `<h3>${escapeHtml(f.title)}</h3><p>${escapeHtml(f.desc)}</p>`;
					featuresEl.appendChild(div);
				});
			}
		})
		.catch(() => {});

	if (form) {
		form.addEventListener('submit', (ev) => {
			ev.preventDefault();
			const data = {
				name: form.querySelector('[name="name"]').value,
				email: form.querySelector('[name="email"]').value,
				message: form.querySelector('[name="message"]').value,
			};
			msgBox.textContent = 'กำลังส่ง...';
			fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			})
			.then(r => r.json())
			.then(resp => {
				if (resp && resp.ok) {
					msgBox.textContent = 'ส่งข้อมูลสำเร็จ ขอบคุณครับ!';
					form.reset();
				} else {
					msgBox.textContent = 'เกิดข้อผิดพลาดในการส่ง';
				}
			})
			.catch(() => { msgBox.textContent = 'เกิดข้อผิดพลาดในการส่ง'; });
		});
	}
});

function escapeHtml(str) {
	if (!str) return '';
	return String(str).replace(/[&<>"']/g, function (s) {
		return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s];
	});
}
