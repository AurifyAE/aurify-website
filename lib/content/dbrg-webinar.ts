export const dbrgWebinar = {
  hero: {
    headline: "e-Invoicing Essentials",
    subline: "Preparing for the Digital Tax Future",
    cta: "Register now",
  },
  details: [
    { label: "Date", value: "10 September 2026" },
    { label: "Time", value: "3:30 PM" },
    { label: "Duration", value: "1 hour" },
    { label: "Platform", value: "Microsoft Teams" },
    { label: "Format", value: "Presentation and Q&A" },
  ],
  overview: {
    title: "Prepare your organization for e-invoicing",
    objective:
      "This webinar will educate stakeholders on e-invoicing requirements, compliance obligations and implementation best practices to support a seamless transition to digital invoicing.",
    takeawayTitle: "What you will take away",
    takeaway:
      "Participants will gain practical insights into e-invoicing requirements, compliance expectations, implementation considerations and the actions needed to prepare their organizations for a successful transition.",
    message: "DBRG: Contributing Member and Compliance Partner",
  },
  agenda: [
    { duration: "10 minutes", title: "Introduction", presenter: "DBRG" },
    { duration: "45 minutes", title: "Technical session", presenter: "Suntech" },
    { duration: "10 minutes", title: "Questions and answers", presenter: "DBRG and Suntech" },
  ],
  speakers: [
    {
      name: "Shabnam Ebrahim",
      role: "General Manager, DBRG",
      contribution: "Moderator and host",
    },
    {
      name: "Tushar Gupta",
      role: "Suntech",
      contribution: "Technical speaker",
    },
  ],
  attendance: "Approximately 75 attendees expected",
  materials: "Presentation materials will be shared.",
  form: {
    title: "Attendee registration",
    introduction:
      "Fields marked with an asterisk are required. Your details will be used to manage your webinar registration.",
    submitLabel: "Register now",
    sendingLabel: "Submitting registration...",
    error:
      "We could not submit your registration. Please try again or contact Aurify directly.",
    success: {
      title: "Registration received",
      message:
        "Thank you for registering. The webinar team will contact you with the Microsoft Teams joining details.",
    },
  },
} as const;
