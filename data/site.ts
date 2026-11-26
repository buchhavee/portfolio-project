export const email = "buchhavee@gmail.com";
const phone = "+45 24 26 43 48";

export const contactLinks = [
  { label: "Email", text: email, href: `mailto:${email}` },
  { label: "Phone", text: phone, href: `tel:${phone.replaceAll(" ", "")}` },
];

export const mainLinks = [
  { label: "Projects", href: "/#projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: `mailto:${email}` },
];

export const elsewhereLinks = [
  { label: "GitHub", href: "https://github.com/buchhavee" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/madsbuchhave/" },
  { label: "Resume (PDF)", href: "" },
].filter((link) => link.href);
