const settings = window.GERMAN_ZONE_SETTINGS ?? {};

function secureUrl(value) {
  try {
    const address = new URL(value);
    return address.protocol === "https:" ? address.href : null;
  } catch {
    return null;
  }
}

for (const track of document.querySelectorAll("[data-carousel]")) {
  let drag;
  track.addEventListener("dragstart", (event) => event.preventDefault());
  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    drag = {id: event.pointerId, x: event.clientX, scroll: track.scrollLeft};
    track.setPointerCapture(event.pointerId);
  });
  track.addEventListener("pointermove", (event) => {
    if (drag?.id !== event.pointerId) return;
    const delta = event.clientX - drag.x;
    if (Math.abs(delta) < 4 && !track.classList.contains("is-dragging")) return;
    track.classList.add("is-dragging");
    track.scrollLeft = drag.scroll - delta;
  });
  track.addEventListener("lostpointercapture", () => {
    drag = null;
    if (!track.classList.contains("is-dragging")) return;
    const viewport = track.getBoundingClientRect();
    const center = viewport.left + viewport.width / 2;
    const offsets = Array.from(track.children, (slide, index) => {
      const rect = slide.getBoundingClientRect();
      return index === 0 ? rect.right - viewport.right : rect.left + rect.width / 2 - center;
    });
    track.scrollLeft += offsets.reduce((nearest, offset) =>
      Math.abs(offset) < Math.abs(nearest) ? offset : nearest);
    track.classList.remove("is-dragging");
  });
}

const registration = secureUrl(settings.registrationApiUrl);
if (!settings.registrationApiUrl && !settings.turnstileSiteKey &&
    /^[1-9][0-9]{7,14}$/.test(settings.whatsappNumber ?? "")) {
  const form = document.querySelector("#registration-form");
  const phone = document.querySelector("#phone");
  const submit = document.querySelector("#registration-submit");
  const status = document.querySelector("#registration-status");
  document.querySelector("#registration-fields").disabled = false;
  submit.disabled = false;
  submit.textContent = "كمّل التسجيل فواتساب";
  status.textContent = "غادي يتحلّ واتساب بالطلب واجد. اضغط إرسال باش يوصلنا.";
  phone.addEventListener("input", () => phone.setCustomValidity(""));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const number = String(data.get("phone")).trim().replace(/[ .()-]/g, "");
    if (!/^\+?[0-9]{8,15}$/.test(number)) {
      phone.setCustomValidity("دخل رقم هاتف صحيح.");
      phone.reportValidity();
      return;
    }
    const message = [
      "السلام عليكم، بغيت نسجّل فـ German Zone.",
      "الاسم: " + String(data.get("name")).trim(),
      "رقم الهاتف: " + number,
      "الإيميل: " + String(data.get("email")).trim(),
    ].join("\n");
    const link = new URL("https://wa.me/" + settings.whatsappNumber);
    link.searchParams.set("text", message);
    window.location.assign(link.href);
  });
}

if (registration && settings.turnstileSiteKey) {
  const form = document.querySelector("#registration-form");
  const fields = document.querySelector("#registration-fields");
  const submit = document.querySelector("#registration-submit");
  const status = document.querySelector("#registration-status");
  let token = "";
  let busy = false;
  let widget;

  function setToken(value = "") {
    token = value;
    submit.disabled = busy || !token;
  }

  const loader = document.createElement("script");
  loader.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  loader.onload = () => {
    fields.disabled = false;
    status.textContent = "";
    widget = window.turnstile.render("#registration-challenge", {
      sitekey: settings.turnstileSiteKey,
      action: "registration",
      callback: setToken,
      "expired-callback": () => setToken(),
      "error-callback": () => {
        setToken();
        status.textContent = "وقع مشكل فالتحقق. عاود حمّل الصفحة.";
      },
    });
  };
  loader.onerror = () => { status.textContent = "تعذّر تحميل التحقق. عاود حمّل الصفحة."; };
  document.head.append(loader);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || !token || !form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    busy = true;
    submit.disabled = true;
    status.textContent = "كنصيفطو الطلب…";
    try {
      const response = await fetch(registration, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name: data.name, phone: data.phone, email: data.email, token}),
        signal: AbortSignal.timeout(20000),
      });
      if (response.ok) {
        form.reset();
        status.textContent = "تقبّل طلب التسجيل. غادي نتاصلو بيك فالواتساب.";
      } else {
        status.textContent = response.status === 400
          ? "راجع الاسم ورقم الهاتف والإيميل، وعاود صيفط الطلب."
          : "الإرسال ما تأكدش. عاود جرّب من بعد شوية.";
      }
    } catch {
      status.textContent = "الإرسال ما تأكدش. راجع الاتصال وعاود جرّب.";
    } finally {
      busy = false;
      setToken();
      if (widget !== undefined) window.turnstile.reset(widget);
    }
  });
}
