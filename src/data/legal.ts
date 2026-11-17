import type { Lang } from '../lib/i18n';

export const legalUpdated = '2026-11-17';
type Section = { heading: string; paragraphs: string[] };
export const legal: Record<Lang, Record<'terms' | 'privacy', Section[]>> = {
  en: {
    terms: [
      { heading: 'About these terms', paragraphs: [
        'These terms apply to standwithiran.org, the Stand With Iran information and resource website. “We” and “us” mean the people maintaining this website. By using the site, you agree to these terms. If you do not agree, please stop using it.',
        'The site shares public information about Iran, human rights, and ways to help. It does not provide accounts, accept payments, or operate the organizations and fundraisers it links to.'
      ] },
      { heading: 'Information and corrections', paragraphs: [
        'Content is for general information and awareness. It is not legal, financial, medical, immigration, or personal security advice. Consult an appropriate professional when you need advice about your circumstances.',
        'We aim to provide useful sources, but reports can be incomplete, disputed, outdated, or corrected. Dates and day counters provide context, not independent verification. Check original sources before relying on or sharing information. Contact us about errors, broken links, or concerns about published material.'
      ] },
      { heading: 'Responsible use', paragraphs: [
        'Use the site lawfully and respect the rights and safety of others. Do not attempt unauthorized access, disrupt the site, introduce malicious code, impersonate its maintainers, or use its content to harass people or expose private information.',
        'Consider your own circumstances before following links, sharing content, donating, or taking part in an activity. We cannot assess local conditions or guarantee your safety.'
      ] },
      { heading: 'External resources and donations', paragraphs: [
        'Links are provided for reference. A listing does not establish affiliation or guarantee a third party’s accuracy, security, conduct, or use of funds. External sites have their own terms and privacy policies, which you should review.',
        'Donations and other transactions take place directly with external organizations or their payment providers. We do not receive or process donations through this site, issue tax receipts, or handle refunds. Verify the recipient and direct transaction questions to the relevant organization.'
      ] },
      { heading: 'Content and reuse', paragraphs: [
        'The website’s source code is released under the Unlicense, as set out in the repository’s LICENSE file. That release does not grant rights to independently owned photographs, logos, reports, or linked material. Their owners’ licenses and any legally permitted uses apply.',
        'When sharing information, preserve attribution and context and do not imply that we or a linked organization endorse you. If you believe material infringes your rights, email us with the page address, a description of the material, and the basis of your concern.'
      ] },
      { heading: 'Availability, warranties, and liability', paragraphs: [
        'The site and its content are provided “as is” and “as available.” To the extent permitted by applicable law, we disclaim warranties of accuracy, availability, fitness for a particular purpose, and non-infringement. We cannot guarantee uninterrupted access, error-free content, or that the site will always be secure.',
        'To the extent permitted by applicable law, the maintainers are not liable for losses arising from use of, or inability to use, this site or reliance on its content or external links. Nothing in these terms excludes liability or limits rights that cannot lawfully be excluded or limited.'
      ] },
      { heading: 'Privacy', paragraphs: [
        'Our Privacy policy explains the information involved in delivering the site and handling email. Please read it alongside these terms.'
      ] },
      { heading: 'Changes and interpretation', paragraphs: [
        'We may update content, remove links, or change or discontinue the site. Revised terms will be posted here with an updated date and apply to subsequent use. If a provision is unenforceable, the remaining provisions continue to apply to the extent allowed by law. Mandatory rights under applicable law remain unaffected.',
        'English and Farsi versions are provided for accessibility. If you notice a difference in meaning, contact us so we can correct it.'
      ] },
    ],
    privacy: [
      { heading: 'Scope and responsibility', paragraphs: [
        'This policy covers standwithiran.org and emails sent to its contact address. “We” means the maintainers of Stand With Iran. It does not cover independent websites, organizations, or social platforms linked from the site.',
        'You can read the site without creating an account or submitting a form. We do not operate a newsletter, comments system, visitor profile database, or payment service on this website.'
      ] },
      { heading: 'Technical information when you visit', paragraphs: [
        'The site is delivered using Amazon Web Services (S3 and CloudFront), with Cloudflare providing DNS. Delivering pages involves processing technical information such as your IP address, requested URL, request time, and browser or device headers. Service providers may process operational and security information to deliver and protect their services.',
        'The site’s current configuration does not enable CloudFront access logging or include visitor analytics. This does not mean your visit is anonymous: hosting and network providers may process technical information independently of application logs.'
      ] },
      { heading: 'Cookies, storage, and tracking', paragraphs: [
        'The website does not set cookies, use local storage for tracking, or include advertising pixels or third-party analytics scripts. Fonts and site images are served with the site. Your browser may cache files as part of normal operation.',
        'We do not sell personal information or share it for targeted advertising, and we do not build visitor profiles. The site does not vary its behavior in response to Do Not Track or Global Privacy Control signals because it does not perform this tracking.'
      ] },
      { heading: 'If you contact us', paragraphs: [
        'If you email us, we receive your email address, any name you provide, message contents, attachments, and associated email metadata. We use that information to respond, investigate reports, make corrections, and protect the site from abuse. Email providers also process messages to deliver and store them.',
        'Provide only what is necessary. Ordinary email is not an anonymous or secure evidence-submission channel. Please do not send identity documents, sensitive testimony, or identifying information about people at risk.'
      ] },
      { heading: 'Links, donations, and sharing', paragraphs: [
        'Opening an external link sends you to another provider, which may collect information under its own policy. Your browser may send the referring site’s origin, depending on the link and browser settings. Donation information goes to the external recipient or payment service, not to this website.',
        'Social sharing buttons open an external sharing service or your device’s share interface only when activated. They may pass the page URL and prepared text. Copy-link buttons write the page address to your clipboard; they do not read its existing contents. We do not embed social feeds or track sharing activity.'
      ] },
      { heading: 'Purposes, disclosure, and international processing', paragraphs: [
        'We use information only for operating and securing the site, handling correspondence, addressing rights or safety concerns, and meeting applicable legal obligations. Where a legal basis is required, these activities generally rely on legitimate interests in maintaining a public information site and responding to requests, or on a legal obligation where applicable.',
        'Information may be processed by hosting and email providers supporting these purposes. We may disclose information when required by law or when necessary to address abuse, protect rights, or respond to a security incident. Providers may process information in countries other than yours, where protections may differ. Applicable transfer requirements must be respected.'
      ] },
      { heading: 'Retention and security', paragraphs: [
        'We keep correspondence only as long as needed to handle the request, maintain a necessary record of the issue, or meet legal obligations. Retention depends on the purpose and any unresolved dispute; this policy does not promise a fixed deletion period. Service providers have their own operational retention practices.',
        'The site uses HTTPS and infrastructure access controls. No website, network, or email service can guarantee complete security or confidentiality.'
      ] },
      { heading: 'Your choices and rights', paragraphs: [
        'You may choose not to email us or use external links and sharing services. Depending on your location and applicable law, you may have rights to access, correct, delete, or obtain a copy of personal information, restrict or object to processing, or withdraw consent where processing relies on consent. You may also have the right to complain to your local data protection authority.',
        'To make a request, email the contact address below and describe what you need. We may ask for proportionate verification before releasing information. We respond within time limits required by applicable law, subject to lawful exceptions. We cannot identify a visitor from a browsing profile because we do not maintain such profiles, and cannot delete information held independently by external sites.'
      ] },
      { heading: 'Children', paragraphs: [
        'This is a general-audience information site, not a service directed at children under 13. We do not knowingly solicit personal information from children. If you believe a child has sent us personal information, contact us so we can review and delete it as appropriate.'
      ] },
      { heading: 'Updates to this policy', paragraphs: [
        'We will publish changes on this page and update the date. If our information practices materially change, we will provide any additional notice or choice required by applicable law.'
      ] },
    ],
  },
  fa: {
    terms: [
      { heading: 'درباره این شرایط', paragraphs: [
        'این شرایط برای وب‌سایت اطلاعات و منابع Stand With Iran در standwithiran.org است. منظور از «ما» گردانندگان این وب‌سایت است. با استفاده از سایت این شرایط را می‌پذیرید؛ اگر موافق نیستید، استفاده را متوقف کنید.',
        'سایت اطلاعات عمومی درباره ایران، حقوق بشر و راه‌های کمک را ارائه می‌کند. حساب کاربری یا دریافت پرداخت ندارد و اداره‌کننده سازمان‌ها یا کارزارهای کمک مالی معرفی‌شده نیست.'
      ] },
      { heading: 'اطلاعات و اصلاحات', paragraphs: [
        'محتوا برای اطلاع‌رسانی عمومی است و مشاوره حقوقی، مالی، پزشکی، مهاجرتی یا امنیت شخصی نیست. برای وضعیت خود از متخصص مناسب راهنمایی بگیرید.',
        'تلاش می‌کنیم منابع مفید ارائه دهیم، اما گزارش‌ها ممکن است ناقص، مورد اختلاف، قدیمی یا اصلاح‌شده باشند. تاریخ‌ها و روزشمارها برای ارائه زمینه‌اند و تأیید مستقل محسوب نمی‌شوند. پیش از اتکا یا بازنشر، منابع اصلی را بررسی کنید. خطاها، پیوندهای خراب یا نگرانی درباره مطالب را به ما اطلاع دهید.'
      ] },
      { heading: 'استفاده مسئولانه', paragraphs: [
        'قانونی از سایت استفاده کنید و حقوق و امنیت دیگران را رعایت کنید. دسترسی غیرمجاز، اختلال در سایت، انتشار کد مخرب، جعل هویت گردانندگان یا استفاده از محتوا برای آزار افراد و افشای اطلاعات خصوصی مجاز نیست.',
        'پیش از باز کردن پیوندها، اشتراک‌گذاری، کمک مالی یا شرکت در فعالیت‌ها شرایط خود را بسنجید. ما نمی‌توانیم شرایط محلی را ارزیابی یا امنیت شما را تضمین کنیم.'
      ] },
      { heading: 'منابع بیرونی و کمک‌های مالی', paragraphs: [
        'پیوندها برای مراجعه ارائه می‌شوند. معرفی یک منبع نشانه وابستگی یا تضمین صحت، امنیت، عملکرد یا نحوه مصرف کمک‌ها نیست. سایت‌های دیگر شرایط و سیاست حریم خصوصی خود را دارند؛ آن‌ها را بررسی کنید.',
        'کمک‌ها و تراکنش‌ها مستقیماً با سازمان‌های بیرونی یا ارائه‌دهندگان پرداخت آن‌ها انجام می‌شوند. ما از طریق این سایت کمک مالی دریافت یا پردازش نمی‌کنیم، رسید مالیاتی نمی‌دهیم و بازپرداخت انجام نمی‌دهیم. هویت گیرنده را بررسی کنید و پرسش‌های تراکنش را با سازمان مربوط مطرح کنید.'
      ] },
      { heading: 'محتوا و بازاستفاده', paragraphs: [
        'کد منبع سایت طبق فایل LICENSE مخزن تحت Unlicense منتشر شده است. این مجوز حقی نسبت به عکس‌ها، نشان‌ها، گزارش‌ها یا مطالب پیوندشده متعلق به دیگران ایجاد نمی‌کند. مجوز صاحبان آن‌ها و استفاده‌های مجاز قانونی ملاک است.',
        'هنگام بازنشر، نام منبع و زمینه مطلب را حفظ کنید و تأیید خود از سوی ما یا سازمانی دیگر را القا نکنید. اگر محتوایی را ناقض حقوق خود می‌دانید، نشانی صفحه، شرح محتوا و دلیل نگرانی را ایمیل کنید.'
      ] },
      { heading: 'دسترسی، ضمانت و مسئولیت', paragraphs: [
        'سایت و محتوای آن «به همین شکل» و «در صورت دسترسی» ارائه می‌شوند. تا حد مجاز قانونی، ضمانتی درباره دقت، دسترس‌پذیری، تناسب برای هدف خاص یا عدم نقض حقوق ارائه نمی‌کنیم. دسترسی بی‌وقفه، محتوای بدون خطا یا امنیت همیشگی تضمین نمی‌شود.',
        'تا حد مجاز قانونی، گردانندگان مسئول زیان ناشی از استفاده یا عدم امکان استفاده از سایت، اتکا به محتوا یا پیوندهای بیرونی نیستند. هیچ بخشی از این شرایط، مسئولیت یا حقوقی را که قانون اجازه حذف یا محدود کردن آن‌ها را نمی‌دهد، حذف یا محدود نمی‌کند.'
      ] },
      { heading: 'حریم خصوصی', paragraphs: [
        'سیاست حریم خصوصی اطلاعات مرتبط با ارائه سایت و رسیدگی به ایمیل‌ها را توضیح می‌دهد. آن را همراه این شرایط بخوانید.'
      ] },
      { heading: 'تغییرات و تفسیر', paragraphs: [
        'ممکن است محتوا یا پیوندها را تغییر دهیم یا حذف کنیم، یا سایت را تغییر دهیم یا متوقف کنیم. شرایط تازه با تاریخ به‌روزشده در این صفحه منتشر می‌شود و بر استفاده بعدی اعمال خواهد شد. اگر بندی قابل اجرا نباشد، سایر بندها تا حد مجاز قانونی معتبر می‌مانند. حقوق الزامی قانونی محفوظ‌اند.',
        'نسخه‌های انگلیسی و فارسی برای دسترسی بیشتر ارائه شده‌اند. اگر تفاوتی در معنا دیدید، برای اصلاح آن با ما تماس بگیرید.'
      ] },
    ],
    privacy: [
      { heading: 'دامنه و مسئولیت', paragraphs: [
        'این سیاست شامل standwithiran.org و ایمیل‌های فرستاده‌شده به نشانی تماس آن است. «ما» یعنی گردانندگان Stand With Iran. این سیاست سایت‌ها، سازمان‌ها یا شبکه‌های اجتماعی مستقل معرفی‌شده را پوشش نمی‌دهد.',
        'برای مطالعه سایت نیازی به حساب یا ارسال فرم نیست. این سایت خبرنامه، بخش دیدگاه‌ها، پایگاه مشخصات بازدیدکنندگان یا خدمات پرداخت ندارد.'
      ] },
      { heading: 'اطلاعات فنی هنگام بازدید', paragraphs: [
        'سایت با خدمات Amazon Web Services شامل S3 و CloudFront ارائه می‌شود و Cloudflare خدمات DNS را فراهم می‌کند. تحویل صفحه مستلزم پردازش اطلاعاتی مانند نشانی IP، نشانی درخواست‌شده، زمان درخواست و سرآیندهای مرورگر یا دستگاه است. ارائه‌دهندگان ممکن است اطلاعات عملیاتی و امنیتی را برای ارائه و حفاظت از خدمات خود پردازش کنند.',
        'در پیکربندی فعلی سایت، ثبت گزارش دسترسی CloudFront فعال نیست و ابزار تحلیل بازدیدکننده وجود ندارد. این به معنای ناشناس بودن بازدید نیست؛ ارائه‌دهندگان میزبانی و شبکه ممکن است مستقل از گزارش‌های برنامه، اطلاعات فنی را پردازش کنند.'
      ] },
      { heading: 'کوکی، ذخیره‌سازی و ردیابی', paragraphs: [
        'سایت کوکی تنظیم نمی‌کند، برای ردیابی از فضای ذخیره‌سازی محلی استفاده نمی‌کند و پیکسل تبلیغاتی یا اسکریپت تحلیل شخص ثالث ندارد. قلم‌ها و تصاویر همراه سایت ارائه می‌شوند. مرورگر ممکن است فایل‌ها را به‌طور معمول در حافظه نهان نگه دارد.',
        'اطلاعات شخصی را نمی‌فروشیم، برای تبلیغات هدفمند به اشتراک نمی‌گذاریم و برای بازدیدکنندگان نمایه نمی‌سازیم. چون این ردیابی را انجام نمی‌دهیم، رفتار سایت در پاسخ به علائم Do Not Track یا Global Privacy Control تغییر نمی‌کند.'
      ] },
      { heading: 'اگر با ما تماس بگیرید', paragraphs: [
        'با ارسال ایمیل، نشانی ایمیل، نامی که ارائه می‌کنید، متن، پیوست‌ها و فراداده مرتبط را دریافت می‌کنیم. از آن‌ها برای پاسخ، بررسی گزارش‌ها، اصلاحات و مقابله با سوءاستفاده استفاده می‌کنیم. ارائه‌دهندگان ایمیل نیز پیام‌ها را برای تحویل و نگهداری پردازش می‌کنند.',
        'فقط اطلاعات لازم را بفرستید. ایمیل معمولی کانال ناشناس یا امن برای ارسال مدارک نیست. مدارک هویتی، شهادت حساس یا اطلاعات شناسایی افراد در معرض خطر را ارسال نکنید.'
      ] },
      { heading: 'پیوندها، کمک مالی و اشتراک‌گذاری', paragraphs: [
        'پیوند بیرونی شما را به ارائه‌دهنده دیگری می‌برد که ممکن است طبق سیاست خود اطلاعات جمع‌آوری کند. بسته به پیوند و تنظیمات مرورگر، مبدأ سایت ارجاع‌دهنده ممکن است ارسال شود. اطلاعات کمک مالی به گیرنده یا خدمات پرداخت بیرونی می‌رود، نه این سایت.',
        'دکمه‌های اشتراک‌گذاری فقط هنگام فعال‌سازی، سرویس بیرونی یا رابط اشتراک دستگاه را باز می‌کنند و ممکن است نشانی صفحه و متن آماده را منتقل کنند. دکمه کپی، نشانی صفحه را در کلیپ‌بورد می‌نویسد و محتوای قبلی آن را نمی‌خواند. خوراک شبکه اجتماعی جاسازی نمی‌کنیم و فعالیت اشتراک‌گذاری را ردیابی نمی‌کنیم.'
      ] },
      { heading: 'هدف، افشا و پردازش بین‌المللی', paragraphs: [
        'از اطلاعات فقط برای اداره و امنیت سایت، رسیدگی به مکاتبات، مسائل حقوقی یا ایمنی و انجام تعهدات قانونی استفاده می‌کنیم. هرجا مبنای قانونی لازم باشد، این فعالیت‌ها معمولاً بر منافع مشروع در نگهداری سایت اطلاع‌رسانی و پاسخ‌گویی، یا در موارد لازم بر تعهد قانونی تکیه دارند.',
        'ارائه‌دهندگان میزبانی و ایمیل ممکن است برای این اهداف اطلاعات را پردازش کنند. در صورت الزام قانونی یا ضرورت رسیدگی به سوءاستفاده، حفاظت از حقوق یا پاسخ به رویداد امنیتی ممکن است اطلاعات را افشا کنیم. پردازش ممکن است در کشورهایی با حمایت‌های متفاوت از کشور شما انجام شود. الزامات قانونی مربوط به انتقال باید رعایت شوند.'
      ] },
      { heading: 'نگهداری و امنیت', paragraphs: [
        'مکاتبات را فقط تا زمانی نگه می‌داریم که برای رسیدگی، حفظ سابقه ضروری موضوع یا تعهد قانونی لازم باشد. مدت به هدف و اختلاف حل‌نشده بستگی دارد؛ این سیاست زمان ثابت حذف را تضمین نمی‌کند. ارائه‌دهندگان خدمات رویه‌های نگهداری عملیاتی خود را دارند.',
        'سایت از HTTPS و کنترل دسترسی زیرساخت استفاده می‌کند. هیچ سایت، شبکه یا سرویس ایمیلی امنیت یا محرمانگی کامل را تضمین نمی‌کند.'
      ] },
      { heading: 'انتخاب‌ها و حقوق شما', paragraphs: [
        'می‌توانید ایمیل نفرستید یا از پیوندها و اشتراک‌گذاری استفاده نکنید. بسته به محل زندگی و قانون قابل اعمال، ممکن است حق دسترسی، اصلاح، حذف یا دریافت نسخه اطلاعات، محدود کردن یا اعتراض به پردازش و پس گرفتن رضایت در پردازش مبتنی بر رضایت را داشته باشید. همچنین ممکن است حق شکایت نزد مرجع محلی حفاظت از داده را داشته باشید.',
        'برای درخواست، به نشانی زیر ایمیل بزنید و نیاز خود را توضیح دهید. پیش از ارائه اطلاعات ممکن است تأیید هویت متناسب بخواهیم. با رعایت استثناهای قانونی، در مهلت مقرر قانون پاسخ می‌دهیم. چون نمایه مرور نگه نمی‌داریم، نمی‌توانیم بازدیدکننده را از روی چنین نمایه‌ای شناسایی کنیم؛ همچنین نمی‌توانیم اطلاعات مستقل سایت‌های دیگر را حذف کنیم.'
      ] },
      { heading: 'کودکان', paragraphs: [
        'این سایت اطلاع‌رسانی برای عموم است و ویژه کودکان زیر ۱۳ سال نیست. آگاهانه از کودکان اطلاعات شخصی درخواست نمی‌کنیم. اگر فکر می‌کنید کودکی اطلاعات شخصی فرستاده، تماس بگیرید تا بررسی و در صورت لزوم حذف کنیم.'
      ] },
      { heading: 'به‌روزرسانی این سیاست', paragraphs: [
        'تغییرات و تاریخ تازه را در این صفحه منتشر می‌کنیم. در صورت تغییر اساسی در شیوه برخورد با اطلاعات، اطلاع‌رسانی یا حق انتخاب اضافی مورد نیاز قانون را ارائه خواهیم کرد.'
      ] },
    ],
  },
};
