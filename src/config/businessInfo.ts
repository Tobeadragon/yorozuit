export const businessInfo = {
  businessName: "YOROZU IT",
  legalForm: "Einzelunternehmen",

  ownerName: "",

  address: {
    street: "",
    postalCode: "",
    city: "Düsseldorf",
    country: "Deutschland",
  },

  contact: {
    email: "",
    telephone: "",
  },

  tax: {
    // Keep this internal; it is never rendered on the website.
    taxNumber: "",
    // Enter only after an Umsatzsteuer-Identifikationsnummer has actually been issued.
    vatId: "",
  },

  website: "https://tobeadragon.github.io/yorozuit/",

  responsiblePerson: {
    name: "",
    address: "",
  },
};

const requiredBusinessValues = [
  businessInfo.businessName,
  businessInfo.legalForm,
  businessInfo.ownerName,
  businessInfo.address.street,
  businessInfo.address.postalCode,
  businessInfo.address.city,
  businessInfo.address.country,
  businessInfo.contact.email,
];

const responsiblePersonComplete =
  (!businessInfo.responsiblePerson.name && !businessInfo.responsiblePerson.address) ||
  (Boolean(businessInfo.responsiblePerson.name.trim()) &&
    Boolean(businessInfo.responsiblePerson.address.trim()));

export const legalInformationComplete =
  requiredBusinessValues.every((value) => typeof value === "string" && value.trim()) &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessInfo.contact.email.trim()) &&
  responsiblePersonComplete;
