export type TeamRole = "CEO" | "Quantitative Research" | "Software Development";

export type TeamMember = {
  slug: string;
  fullName: string;
  designation: string;
  role: TeamRole;
  initials: string;
  summary: string;
  biography: string[];
  qualifications?: string;
  focus?: string;
  emailAddress?: string;
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: string;
};

export const teamMembers: TeamMember[] = [
  {
    slug: "lucas-zarzeczny",
    fullName: "Lucas Zarzeczny",
    designation: "CEO",
    role: "CEO",
    initials: "LZ",
    summary:
      "Lucas leads QSentia's company strategy across investor relations, product direction, research prioritization, and institutional partnerships.",
    biography: [
      "Lucas Zarzeczny is the CEO of QSentia. He leads the company's strategy across investor relations, product direction, research prioritization, and institutional partnerships.",
      "Lucas oversees the firm's operating direction and keeps the team aligned around source-backed model telemetry, disciplined risk controls, and a clear commercial path for systematic investment infrastructure.",
      "His work focuses on building a company that can serve both investor diligence workflows and platform customers who need reliable model access, operational controls, and API-ready investment infrastructure.",
    ],
    focus:
      "Firm strategy, investor relations, product direction, model commercialization, and operating governance.",
    imageSrc: "/team/lucas-zarzeczny-v2.png",
    imageAlt: "Lucas Zarzeczny",
    imagePosition: "center 20%",
  },
  {
    slug: "anikesh-bhuvaneshwaram",
    fullName: "Anikesh Bhuvaneshwaram",
    designation: "Quantitative Research",
    role: "Quantitative Research",
    initials: "AB",
    summary:
      "Anikesh focuses on quantitative modelling, backtesting, risk management, and time series analysis for systematic investment workflows.",
    biography: [
      "Anikesh Bhuvaneshwaram works in quantitative research at QSentia. He focuses on quantitative modelling, backtesting, risk management, and time series analysis for systematic investment workflows.",
      "Before joining QSentia's research work, Anikesh built a technical foundation across software engineering and quantitative methods, including prior software engineering experience at VISA.",
      "Anikesh holds a Bachelor's in Computer Science from NUS and is pursuing a Master's in Financial Engineering from UCLA.",
    ],
    qualifications:
      "Bachelor's in Computer Science, NUS. Master's in Financial Engineering, UCLA.",
    focus: "Quantitative research, software engineering, and AI/ML engineering.",
    emailAddress: "b.anikesh@gmail.com",
    imageSrc: "/team/anikesh-bhuvaneshwaram.png",
    imageAlt: "Anikesh Bhuvaneshwaram",
    imagePosition: "center 36%",
  },
  {
    slug: "spencer-ozgur",
    fullName: "Spencer Ozgur",
    designation: "Quantitative Research",
    role: "Quantitative Research",
    initials: "SO",
    summary:
      "Spencer works across quantitative research, systematic investing, machine learning, stochastic modeling, and time series analysis.",
    biography: [
      "Spencer Ozgur works in quantitative research at QSentia and is an M.S. Financial Engineering student at Columbia University with interests in quantitative research, systematic investing, and machine learning.",
      "Spencer has experience in stochastic modeling, time series analysis, filtering methods, and quantitative strategy development through research projects in options, market microstructure, and optimal execution.",
      "Spencer holds a B.S. in Computer Science from Arizona State University and is expected to complete his M.S. Financial Engineering at Columbia University in December 2026.",
    ],
    qualifications:
      "M.S. Financial Engineering, Columbia University (expected Dec. 2026). B.S. Computer Science, Arizona State University (2024).",
    focus:
      "Python, quantitative research, machine learning, time series analysis, stochastic processes, statistical modeling, options, systematic investing, financial engineering, and data science.",
    emailAddress: "so2770@columbia.edu",
    imageSrc: "/team/spencer-ozgur.png",
    imageAlt: "Spencer Ozgur",
    imagePosition: "center 42%",
  },
  {
    slug: "samhitha-mantena",
    fullName: "Samhitha Mantena",
    designation: "Quantitative Research",
    role: "Quantitative Research",
    initials: "SM",
    summary:
      "Samhitha supports model evaluation, signal review, research documentation, and evidence workflows for QSentia's research process.",
    biography: [
      "Samhitha Mantena supports QSentia's quantitative research work across model evaluation, signal review, and research documentation.",
      "Her work helps translate analytical outputs into reviewable evidence for model and strategy workflows, keeping research artifacts clear for investor-facing and platform-facing review.",
    ],
    focus:
      "Model research support, research documentation, and quantitative workflow review.",
  },
  {
    slug: "janet-chen",
    fullName: "Janet Chen",
    designation: "Quantitative Research",
    role: "Quantitative Research",
    initials: "JC",
    summary:
      "Janet supports model evidence, analytical review, and research workflow coordination for investor and platform materials.",
    biography: [
      "Janet Chen supports the quantitative research function with a focus on model evidence, analytical review, and research workflow coordination.",
      "She contributes to the structure and review of research materials used across investor-facing diligence, internal research processes, and platform documentation.",
    ],
    focus:
      "Analytical review, research coordination, and model evidence workflows.",
  },
  {
    slug: "debashish-mishra",
    fullName: "Debashish Mishra",
    designation: "Software Development",
    role: "Software Development",
    initials: "DM",
    summary:
      "Debashish contributes to application implementation, platform workflow support, and product delivery across QSentia surfaces.",
    biography: [
      "Debashish Mishra contributes to QSentia's software development work across application implementation, platform workflow support, and product delivery.",
      "His work supports internal and customer-facing surfaces, helping the product team turn business requirements into reliable application workflows.",
    ],
    focus:
      "Application development, platform workflows, and product implementation.",
    imageSrc: "/team/debashish-mishra-v2.png",
    imageAlt: "Debashish Mishra",
    imagePosition: "center 24%",
  },
  {
    slug: "shlok-chauhan",
    fullName: "Shlok Chauhan",
    designation: "Software Development",
    role: "Software Development",
    initials: "SC",
    summary:
      "Shlok Chauhan works across the public website, dashboard experience, customer workflows, and operational tooling.",
    biography: [
      "Shlok Chauhan contributes to QSentia's software development and product execution across the public website, dashboard experience, customer workflows, and operational tooling.",
      "His work focuses on making the platform experience clearer for investors, customers, and internal operators as QSentia expands its model access and API workflow surfaces.",
    ],
    focus:
      "Frontend implementation, dashboard workflows, customer portal experience, and product operations.",
    imageSrc: "/team/shlok-chauhan-v2.png",
    imageAlt: "Shlok Chauhan",
    imagePosition: "center 30%",
  },
  {
    slug: "nidhish-gautam",
    fullName: "Nidhish Gautam",
    designation: "Software Development",
    role: "Software Development",
    initials: "NG",
    summary:
      "Nidhish supports product implementation, system interfaces, and customer workflow readiness for QSentia.",
    biography: [
      "Nidhish Gautam contributes to QSentia's software development function across product implementation, system interfaces, and customer workflow readiness.",
      "His work supports the software layer needed for model access, operational dashboards, and platform delivery.",
    ],
    focus:
      "Product implementation, system interfaces, and software workflow delivery.",
  },
  {
    slug: "priyansh-kumar",
    fullName: "Priyansh Kumar",
    designation: "Software Development",
    role: "Software Development",
    initials: "PK",
    summary:
      "Priyansh contributes to application delivery, interface implementation, and platform support.",
    biography: [
      "Priyansh Kumar contributes to QSentia's software development work across application delivery, interface implementation, and platform support.",
      "His work helps improve the product surfaces that customers and internal operators use to manage model access, workflows, and account operations.",
    ],
    focus:
      "Application delivery, interface implementation, and platform support.",
  },
  {
    slug: "deepanshu-yadav",
    fullName: "Deepanshu Yadav",
    designation: "Software Development",
    role: "Software Development",
    initials: "DY",
    summary:
      "Deepanshu supports implementation, product workflows, platform delivery, and operational controls.",
    biography: [
      "Deepanshu Yadav contributes to QSentia's software development work across implementation support, product workflows, and platform delivery.",
      "His work supports the engineering processes behind customer dashboards, operational controls, and internal workflow surfaces.",
    ],
    focus:
      "Implementation support, product workflows, and platform delivery.",
  },
  {
    slug: "ashutosh",
    fullName: "Ashutosh",
    designation: "Software Development",
    role: "Software Development",
    initials: "AS",
    summary:
      "Ashutosh contributes to platform implementation, product support, and engineering delivery.",
    biography: [
      "Ashutosh contributes to QSentia's software development work across platform implementation, product support, and engineering delivery.",
      "His work supports the technical execution needed to maintain and improve QSentia's website, dashboard, and platform workflows.",
    ],
    focus:
      "Platform implementation, product support, and engineering delivery.",
  },
];

export function getTeamMember(slug: string) {
  return teamMembers.find((member) => member.slug === slug);
}
