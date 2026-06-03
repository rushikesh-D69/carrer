export interface FallbackCareerSectionData {
  section_type: 'overview' | 'eligibility' | 'salary' | 'preparation_timeline' | 'roadmap' | 'resources' | 'faq' | 'study_materials' | 'books' | 'videos' | 'practice_tests' | 'nature_strategy' | 'feedback'
  title: string
  content_md?: string
  content_json?: any
}

export const FALLBACK_CAREER_DETAILS: Record<string, FallbackCareerSectionData[]> = {
  'upsc-civil-services': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
The **UPSC Civil Services Examination (CSE)** is India's most prestigious administrative gateway, recruiting for All India Services (IAS, IPS, IFS) and Central Services.

### Why Choose Civil Services?
* **High Impact:** Administer districts, design policies, and execute welfare programs directly.
* **Prestige & Status:** Represent the state, lead departments, and influence governance.
* **Growth:** Climb to administrative heights like Cabinet Secretary or State Chief Secretary.
`
    },
    {
      section_type: 'nature_strategy',
      title: 'Nature & Strategy',
      content_md: `
### Exam Nature
The UPSC exam is a three-tier process demanding academic rigor, analytical thinking, and mental stamina:
1. **Preliminary Examination:** Two objective papers (General Studies and CSAT) to screen candidates.
2. **Main Examination:** Nine descriptive written papers testing comprehension, ethics, optional subjects, and essay writing.
3. **Personality Test (Interview):** A face-to-face assessment evaluating integrity, leadership, and public service mindset.

### Strategic Roadmap
* **Syllabus Mastery:** Treat the UPSC syllabus as your primary guide; map every topic.
* **Newspaper Discipline:** Dedicate 1.5 hours daily to *The Hindu* or *The Indian Express*.
* **Mains Answer Writing:** Start writing 2 answers daily after 4 months of core reading.
* **Optional Subject Selection:** Choose based on interest and graduation background, scoring 300+ marks is key.
`
    },
    {
      section_type: 'study_materials',
      title: 'Study Material',
      content_md: `
To succeed, focus on high-quality resource consolidation:
* **Polity:** *Indian Polity* by M. Laxmikanth.
* **History:** NCERTs (Class 6-12) & *Modern History Spectrum* by Rajiv Ahir.
* **Geography:** NCERTs (Class 11 & 12) & *Physical and Human Geography* by G.C. Leong.
* **Economics:** *Indian Economy* by Ramesh Singh or class notes by Mrunal Patel.
* **Environment:** Shankar IAS Academy booklet.
* **Ethics (GS4):** *Lexicon* or Subba Rao.
`
    },
    {
      section_type: 'practice_tests',
      title: 'Practice Test',
      content_md: `
### Prelims & Mains Drill
* **Prelims Tests:** Solve 30-40 full-length mock tests to master elimination techniques.
* **CSAT Mocks:** Solve at least 5 previous CSAT papers to secure the 33% qualifying score.
* **Mains Test Series:** Enroll in a structured test series post-prelims to build stamina for writing 3 hours continuously.
`
    },
    {
      section_type: 'feedback',
      title: 'Professor Feedback',
      content_md: `
Our platform offers a direct gateway for personalized evaluations:
* Submit your answers directly to our panel of educators.
* Get detailed feedback on structure, diagrams, and content presentation.
* Review previous year UPSC papers with expert evaluations.
`
    },
    {
      section_type: 'roadmap',
      title: 'Preparation Roadmap',
      content_json: [
        {
          phase: 'Phase 1: Foundation (3-4 Months)',
          description: 'Read NCERT textbooks (Class 6-12) for core subjects and develop daily newspaper reading habits.'
        },
        {
          phase: 'Phase 2: Core Prep (6 Months)',
          description: 'Finish Optional subject syllabus and master Laxmikanth, Spectrum, and Mrunal. Start answer writing.'
        },
        {
          phase: 'Phase 3: Prelims Sprint (3 Months)',
          description: 'Focus strictly on objective tests, CSAT shortcuts, and current affairs compilations.'
        },
        {
          phase: 'Phase 4: Mains Sprint (3 Months)',
          description: 'Write daily mocks, refine short notes, and practice essay writing.'
        }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'Is coaching essential?', a: 'No. Abundant online resources and standard guidebooks make self-study highly viable.' },
        { q: 'Can average students clear UPSC?', a: 'Yes. Dedicated effort, consistency, and exam-oriented strategy matter far more than past grades.' }
      ]
    }
  ],
  'ssc-cgl': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
The **Staff Selection Commission (SSC)** recruits Group B and C posts across central ministries, direct taxes, custom houses, and central auditing boards.
* **Popular Posts:** Income Tax Inspector, Assistant Section Officer (ASO), Central Excise Inspector, CBI Sub-Inspector.
* **Highlights:** Work-life balance, permanent postings in cities, and fast promotion tracks.
`
    },
    {
      section_type: 'eligibility',
      title: 'Eligibility & Selection',
      content_md: `
* **Education:** Bachelor's degree in any discipline from a recognized university.
* **Age Limit:** 18-30 years (with standard relaxations for OBC/SC/ST).
* **Pattern:** Tier 1 (Qualifying: Maths, English, Reasoning, GS) and Tier 2 (Merit: Computer-based test including Maths, English, Reasoning, General Awareness, and Computer proficiency).
`
    },
    {
      section_type: 'roadmap',
      title: 'SSC Preparation Roadmap',
      content_json: [
        { phase: 'Phase 1: Concept Building (3 Months)', description: 'Master Quantitative Aptitude formulas, English grammar rules, and verbal reasoning.' },
        { phase: 'Phase 2: Speed Practice (2 Months)', description: 'Solve Previous Years Questions (PYQs) using shortcut methods to improve timing.' },
        { phase: 'Phase 3: Mock Drills (2 Months)', description: 'Take 50+ full-length online mocks to perfect speed and accuracy.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'Are there interviews in SSC CGL?', a: 'No, interviews have been abolished for all Group B and C non-gazetted posts.' }
      ]
    }
  ],
  'rrb-railway': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
The **Railway Recruitment Board (RRB)** manages recruitment for technical and non-technical staff in the Indian Railways, one of the world's largest employers.
* **Key Posts:** NTPC (Commercial Apprentice, Station Master, Clerk), Junior Engineer (JE), and Assistant Loco Pilot (ALP).
* **Benefits:** Travel concessions, residential quarters, healthcare, and reliable retirement security.
`
    },
    {
      section_type: 'eligibility',
      title: 'Selection & Exam Structure',
      content_md: `
* **Qualification:** Varies from 10th/12th pass (for Group D/Clerk), Diploma/Degree in Engineering (for JE), to Graduation (for NTPC).
* **Exam Stages:** Stage 1 Computer Based Test (CBT), Stage 2 CBT (post-specific), followed by Document Verification and Medical Examinations.
`
    },
    {
      section_type: 'roadmap',
      title: 'RRB Career Roadmap',
      content_json: [
        { phase: 'Phase 1: Foundation (2 Months)', description: 'Focus on Quantitative Aptitude, General Intelligence, and General Science (NCERT physics/chemistry).' },
        { phase: 'Phase 2: Mock Practice (2 Months)', description: 'Take online tests targeting RRB pattern and practice speed maths.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'Are technical degrees required for NTPC?', a: 'No, graduation in any stream makes you eligible for NTPC posts.' }
      ]
    }
  ],
  'banking-ibps-sbi': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
Banking exams like **SBI PO** and **IBPS PO** recruit Probationary Officers to lead public sector bank branches, oversee credit/deposits, and manage loans.
* **Benefits:** Rapid, merit-based career progression to General Manager, subsidized credit, and executive allowances.
`
    },
    {
      section_type: 'eligibility',
      title: 'Eligibility & Exam Structure',
      content_md: `
* **Education:** Graduation in any field.
* **Age:** 21-30 years.
* **Selection Process:** 
  1. Preliminary Exam (Quantitative, Reasoning, English - 1 hour).
  2. Mains Exam (Data Analysis, Banking Awareness, Reasoning, Descriptive Essay - 3.5 hours).
  3. Group Exercises and Interview.
`
    },
    {
      section_type: 'roadmap',
      title: 'Banking Career Roadmap',
      content_json: [
        { phase: 'Phase 1: Speed Maths & Calculations (1 Month)', description: 'Memorize tables, fractions, and Vedic math techniques for quick simplifications.' },
        { phase: 'Phase 2: Reasoning Puzzles & DI (2 Months)', description: 'Solve circular, linear, and floor puzzles daily. Practice advanced Data Interpretation.' },
        { phase: 'Phase 3: General Awareness (1 Month)', description: 'Learn banking terms, RBI policies, and current affairs of the last 6 months.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'Can final year students apply?', a: 'Yes, if they can produce proof of graduation before the interview date.' }
      ]
    }
  ],
  'appsc-state': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
The **Andhra Pradesh Public Service Commission (APPSC)** recruits administrative officers for the government of Andhra Pradesh.
* **Key Posts:** Group 1 (Deputy Collector, DSP, CTO), Group 2 (Municipal Commissioner, Sub-Registrar, ACTO), Group 4 (Junior Assistants).
* **Highlights:** Stay close to your home state, enjoy high administrative power, and direct regional policies.
`
    },
    {
      section_type: 'eligibility',
      title: 'Eligibility & Exam Pattern',
      content_md: `
* **Education:** Graduation from a recognized university.
* **Language:** Proficiency in Telugu is essential.
* **Structure:** Group 1 has Prelims (2 papers) and Mains (5 descriptive papers + Telugu language test). Group 2 features objective screening and mains exams.
`
    },
    {
      section_type: 'roadmap',
      title: 'APPSC Preparation Roadmap',
      content_json: [
        { phase: 'Phase 1: State Geography & History (2 Months)', description: 'Master AP Reorganization Act, Satavahana history, and geographical divisions.' },
        { phase: 'Phase 2: General Studies (3 Months)', description: 'Read standard books for Indian Polity, Economy, and Science & Tech.' },
        { phase: 'Phase 3: Test Series (2 Months)', description: 'Practice AP-specific mock series and solve past papers.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'Is there a Telugu language qualifying paper?', a: 'Yes, Group 1 Mains has a compulsory qualifying paper in Telugu.' }
      ]
    }
  ],
  'private-local': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
**Local Private Sector Careers** encompass employment opportunities in local businesses, retail management, municipal operations, and small-to-medium enterprises (SMEs) in your local town or city.
* **Typical Roles:** Store Managers, Local Accountants, Administrative Officers, and Sales Executives.
* **Benefits:** Close to home, community connection, and easier entry criteria.
`
    },
    {
      section_type: 'eligibility',
      title: 'Entry Requirements & Skill Set',
      content_md: `
* **Skills:** Local language fluency, sales acumen, customer handling, and basic computer knowledge (Excel, Tally).
* **Qualifications:** Undergraduates or Graduates in any discipline. Specialized roles (like accounts) require specific backgrounds.
`
    },
    {
      section_type: 'roadmap',
      title: 'Local Job Entry Roadmap',
      content_json: [
        { phase: 'Phase 1: Skill Upgrading', description: 'Gain basic certificates in computer operations, digital marketing, or accounting packages.' },
        { phase: 'Phase 2: Networking & Applications', description: 'Create a clean resume. Register on local portals and network with local business owners.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'Are these jobs secure?', a: 'Local private jobs depend on business health, but qualified professionals are always in demand.' }
      ]
    }
  ],
  'private-regional': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
**Regional Private Careers** include jobs in state-level industries, manufacturing zones, regional banking, and corporate offices centered around hubs like Hyderabad, Vizag, or Vijayawada.
* **Typical Roles:** Regional Sales Officers, Production Engineers in industrial zones, Operations managers.
`
    },
    {
      section_type: 'eligibility',
      title: 'Skills & Entry Requirements',
      content_md: `
* **Skills:** Fluent in regional and English languages, project coordination, and technical skills matching the industry (e.g., mechanical engineering for factories).
* **Qualification:** Diploma or Bachelor's degrees in relevant streams (BA, BBA, B.Com, B.Tech).
`
    },
    {
      section_type: 'roadmap',
      title: 'Regional Job Entry Roadmap',
      content_json: [
        { phase: 'Phase 1: Identification', description: 'Identify active industrial/corporate zones in your region (e.g. APIIC zones).' },
        { phase: 'Phase 2: Tailoring Profile', description: 'Update profile on national sites highlighting availability in regional hubs.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'Is travel required?', a: 'Yes, regional sales and operations roles often require extensive travel across the state/region.' }
      ]
    }
  ],
  'private-national': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
**National Private Careers** involve working for major Indian corporate houses (Tata, Reliance, Birla), national logistics providers, private banks (HDFC, ICICI), and national IT giants (TCS, Infosys).
* **Highlights:** Relocation opportunities to major metros, structured training programs, and medical/insurance cover.
`
    },
    {
      section_type: 'eligibility',
      title: 'Qualifications & Selection',
      content_md: `
* **Selection:** National-level exams (like TCS NQT, AMCAT), campus placements, or structured technical interviews.
* **Qualifications:** Graduates in Engineering, Business Administration (MBA), Commerce, or Science.
`
    },
    {
      section_type: 'roadmap',
      title: 'National Job Entry Roadmap',
      content_json: [
        { phase: 'Phase 1: Target Aptitude', description: 'Prepare for national aptitude and coding test platforms (AMCAT, CoCubes, eLitmus).' },
        { phase: 'Phase 2: Interview Prep', description: 'Practice case studies, behavioral questions, and core technical concepts.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'Do they support remote work?', a: 'Many IT companies offer hybrid work models, but most operations roles require metro relocation.' }
      ]
    }
  ],
  'private-international': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
**International Private Careers** offer placements in Multinational Corporations (Google, Microsoft, Amazon), international consultancies (Deloitte, McKinsey), and export-import companies.
* **Benefits:** Exposure to global standards, dollar-backed salary potential, and potential overseas relocation.
`
    },
    {
      section_type: 'eligibility',
      title: 'Required High-Level Skills',
      content_md: `
* **Skills:** Excellent communication, expertise in advanced tech stacks, quantitative analysis, or niche domains.
* **Requirements:** Proven record of independent projects, worldwide certifications, or degrees from premier institutions.
`
    },
    {
      section_type: 'roadmap',
      title: 'International Career Roadmap',
      content_json: [
        { phase: 'Phase 1: Profile Building', description: 'Contribute to open-source project frameworks, write tech papers, or earn AWS/Cisco certifications.' },
        { phase: 'Phase 2: Global Applications', description: 'Apply via global referrals, LinkedIn optimization, or remote work platforms.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'Is a foreign visa required?', a: 'For remote contracts, no. For relocation, the hiring MNC handles sponsor work visas.' }
      ]
    }
  ],
  'self-employment-home': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
**Home Related Self Employment** allows individuals to monetize skills from their homes, leveraging the internet and local networks.
* **Ideas:** Freelance content creation, graphic designing, online custom tutoring, home bakeries, or translation services.
`
    },
    {
      section_type: 'eligibility',
      title: 'Setup & Prerequisites',
      content_md: `
* **Tools:** High-speed internet, functional computer/laptop, or specialized kitchen/design tools.
* **Qualifications:** Self-taught expertise. Portfolio of previous work is critical to acquire clients.
`
    },
    {
      section_type: 'roadmap',
      title: 'Home Business Roadmap',
      content_json: [
        { phase: 'Phase 1: Portfolio Building', description: 'Create sample designs/writings and build a simple portfolio website.' },
        { phase: 'Phase 2: Client Sourcing', description: 'Join freelancer portals (Upwork, Fiverr) and leverage social channels for outreach.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'How to manage monthly cashflow?', a: 'Start as a side-hustle. Build a client base before transitioning to full-time.' }
      ]
    }
  ],
  'self-employment-qualification': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
**Qualification Related Self Employment** involves setting up a professional practice based on certified credentials.
* **Practices:** Legal chambers, accounting/tax consultancies (CA, CS), clinics/pharmacies, and architecture/civil drafting studios.
`
    },
    {
      section_type: 'eligibility',
      title: 'Registrations & Certifications',
      content_md: `
* **Must-have:** Valid license to practice (from ICAI, Bar Council of India, Medical Council, etc.).
* **Compliance:** Local municipal business registration, professional tax registration, and GST if crossing thresholds.
`
    },
    {
      section_type: 'roadmap',
      title: 'Professional Practice Roadmap',
      content_json: [
        { phase: 'Phase 1: Apprenticeship', description: 'Work 2-3 years under an established practitioner to learn daily operations.' },
        { phase: 'Phase 2: Launch', description: 'Set up an office, obtain license registers, and start servicing clients.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'What is the initial investment?', a: 'Moderate. Costs include office rental, office automation tools, and licensing fees.' }
      ]
    }
  ],
  'self-employment-market': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
**Market Related Self Employment** centers on trading, retail distribution, franchise operations, or real estate agency models dependent on physical market demand.
* **Ideas:** Local grocery/electronics franchise, agricultural distribution agency, wholesale business.
`
    },
    {
      section_type: 'eligibility',
      title: 'Capital & Setup Requirements',
      content_md: `
* **Skills:** Negotiation, inventory tracking, vendor management, and credit management.
* **Prerequisites:** Working capital, prime shop location, GST certification, and trade licensing.
`
    },
    {
      section_type: 'roadmap',
      title: 'Market Business Roadmap',
      content_json: [
        { phase: 'Phase 1: Demand Assessment', description: 'Analyze foot traffic, local competition, and choose franchise or independent models.' },
        { phase: 'Phase 2: Vendor Tie-up', description: 'Negotiate credit terms with wholesale suppliers or finalise franchise agreements.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'How to tackle online e-commerce competition?', a: 'Focus on immediate local delivery, personalized customer service, and credit trust relationships.' }
      ]
    }
  ],
  'self-employment-passion': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
**Passion Related Self Employment** is the pursuit of converting creative arts, fitness, or hobby expertise into a monetized business model.
* **Ideas:** Photography studios, music/dance schools, gym/yoga instruction, and travel curations.
`
    },
    {
      section_type: 'eligibility',
      title: 'Requirements & Brand Building',
      content_md: `
* **Key Focus:** High personal skill level, engaging communication, and brand building via social media channels (YouTube, Instagram).
* **Pre-requisites:** Specialized equipment (cameras, instruments, studio gear).
`
    },
    {
      section_type: 'roadmap',
      title: 'Passion-to-Business Roadmap',
      content_json: [
        { phase: 'Phase 1: Content Sharing', description: 'Share tips, tutorials, and performance videos online to build a community.' },
        { phase: 'Phase 2: Monetization', description: 'Offer online masterclasses, set up physical academies, or take commercial bookings.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'Is this path stable?', a: 'Cashflows fluctuate seasonally, but a strong community brand provides recurring earnings.' }
      ]
    }
  ],
  'entrepreneurship-individual': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
**Individual Support System** focuses on mentorship, individual guidance, and techniques for solo founders or partners bootstrapping startups without massive early institutional funding.
* **Pillars:** Bootstrapping models, personal network mentoring, and customer-funded growth.
`
    },
    {
      section_type: 'eligibility',
      title: 'Key Strategies',
      content_md: `
* **Zero Capital Growth:** Reinvest early sales directly into product development.
* **Mentor networks:** Connect with successful regional founders via platform panels for one-on-one reviews.
`
    },
    {
      section_type: 'roadmap',
      title: 'Solo Founder Roadmap',
      content_json: [
        { phase: 'Phase 1: MVP Design', description: 'Build a minimal product by yourself or with co-founders.' },
        { phase: 'Phase 2: Customer Funding', description: 'Charge clients early to fund subsequent features and operations.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'Can a solo founder raise VC?', a: 'Yes, though VCs prefer teams, solo founders with strong customer traction are regularly funded.' }
      ]
    }
  ],
  'entrepreneurship-institutions': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
**Institutional Ecosystem** covers support from incubators, accelerators, and specialized government setups (like T-Hub, IIIT-H, IIT Hyderabad) in India.
* **Benefits:** Co-working space, testing labs, administrative services, and direct access to venture funds.
`
    },
    {
      section_type: 'eligibility',
      title: 'Admission Criteria',
      content_md: `
* **Innovation:** Startups with innovative tech, social impact, or scalability.
* **Selection:** Pitch deck screening, viability checks, and interview rounds by incubator board.
`
    },
    {
      section_type: 'roadmap',
      title: 'Incubation Roadmap',
      content_json: [
        { phase: 'Phase 1: Pitch Deck Prep', description: 'Define the problem, solution, market size, and team profile.' },
        { phase: 'Phase 2: Application', description: 'Apply to regional incubation channels (like T-Hub or AIC centers) during cohort calls.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'Do incubators take equity?', a: 'Some do, while others charge a nominal rental/administration fee. Check terms carefully.' }
      ]
    }
  ],
  'entrepreneurship-legal': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
**Legal Support Framework** teaches critical regulatory compliance for starting up in India.
* **Key Areas:** Choosing between Private Limited, LLP, or Partnership; intellectual property filings; and labor law self-certifications under Startup India.
`
    },
    {
      section_type: 'eligibility',
      title: 'Regulatory Steps',
      content_md: `
1. **Company Incorporation:** File SPICe+ form with Ministry of Corporate Affairs (MCA) to get CIN and PAN.
2. **IP Protection:** File trademarks and design patents early.
3. **Compliance:** Complete GST registration and secure municipal licenses.
`
    },
    {
      section_type: 'roadmap',
      title: 'Legal Compliance Roadmap',
      content_json: [
        { phase: 'Phase 1: Entity Choice', description: 'Evaluate liability limits and tax structures to choose LLP or Pvt Ltd.' },
        { phase: 'Phase 2: MCA Filing', description: 'Secure digital signatures (DSC) and submit incorporation papers.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'How long does incorporation take?', a: 'Usually 7 to 10 working days if all documents are in order.' }
      ]
    }
  ],
  'entrepreneurship-financial': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
**Financial Schemes & Capital** addresses funding mechanisms for startups, from central grants to credit lines.
* **Government Support:** Startup India Seed Fund (SISFS), Mudra Loans (Shishu, Kishore, Tarun), and CGTMSE collateral-free credit programs.
`
    },
    {
      section_type: 'eligibility',
      title: 'Securing Capital',
      content_md: `
* **Grants:** Startups registered under DPIIT are eligible for seed fund grants up to ₹20L for validation, or debt up to ₹50L for market entry.
* **Bank Credit:** CGTMSE supports loans up to ₹2 Crore for MSMEs without demanding third-party guarantees.
`
    },
    {
      section_type: 'roadmap',
      title: 'Funding Roadmap',
      content_json: [
        { phase: 'Phase 1: DPIIT Registration', description: 'Submit company details to Startup India portal to receive DPIIT recognition.' },
        { phase: 'Phase 2: Grant Pitching', description: 'Pitch to selected incubator panels managing the Seed Fund Scheme.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'What is a collateral-free loan?', a: 'A loan where the government acts as a guarantor, so the bank does not ask for property mortgages.' }
      ]
    }
  ],
  'economic-literacy-wealth': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
**Wealth Concept & Principles** forms the baseline of economic literacy, teaching students how to grow savings and secure their financial future.
* **Core Topics:** Time value of money, power of compounding, asset allocation (equities, debt, gold), and managing inflation.
`
    },
    {
      section_type: 'eligibility',
      title: 'Core Wealth Principles',
      content_md: `
* **Compounding:** Start saving early to give your money time to multiply.
* **Asset/Liability:** Understand that assets put money in your pocket (stocks, real estate), while liabilities take money out (consumer loans, luxury cars).
* **Inflation:** Keep funds in assets that outpace the inflation rate (currently 5-6% in India).
`
    },
    {
      section_type: 'roadmap',
      title: 'Financial Literacy Roadmap',
      content_json: [
        { phase: 'Phase 1: Budgeting', description: 'Track monthly expenses. Use the 50/30/20 rule (Needs/Wants/Savings).' },
        { phase: 'Phase 2: Index Investing', description: 'Set up a mutual fund SIP targeting broad market indexes (Nifty 50) for long-term growth.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'How much should I invest monthly?', a: 'Aim for at least 20% of your net income, increasing the amount as your salary grows.' }
      ]
    }
  ],
  'economic-literacy-health': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
**Sustainable Health & Insurance** emphasizes that health security protects wealth. A single medical emergency can erase years of savings.
* **Pillars:** Term insurance (for dependents), health insurance (family floiter packages), and emergency fund creation.
`
    },
    {
      section_type: 'eligibility',
      title: 'Security Scaffolding',
      content_md: `
* **Emergency Fund:** Liquid cash equivalent to 6 months of living expenses kept in a savings bank/liquid fund.
* **Health Cover:** Secure a minimum ₹5-10L health insurance package separate from company-provided health cover.
* **Term Insurance:** Pure protection term plan equal to 10-15 times your annual income.
`
    },
    {
      section_type: 'roadmap',
      title: 'Health Security Roadmap',
      content_json: [
        { phase: 'Phase 1: Liquid Cash Shield', description: 'Build your emergency fund before making long-term investments.' },
        { phase: 'Phase 2: Insurance Selection', description: 'Analyze term policies, check claim settlement ratios, and purchase base health covers.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'Is term insurance a waste if I survive?', a: 'No, it is pure security. Survival benefit plans (TROP) are much more expensive and offer lower returns than index funds.' }
      ]
    }
  ],
  'economic-literacy-citizen': [
    {
      section_type: 'overview',
      title: 'Career Overview',
      content_md: `
**Informed Responsible Citizen** covers civic financial literacy, focusing on tax rules and consumer rights in India.
* **Topics:** Direct tax (Income tax slabs, old vs. new regime), indirect tax (understanding GST bills), and Consumer Protection laws.
`
    },
    {
      section_type: 'eligibility',
      title: 'Civic Financial Knowledge',
      content_md: `
* **Income Tax:** Learn how to file your own ITR (ITR-1/ITR-2) and check deductions under Section 80C.
* **GST:** Read bills to verify that restaurants/sellers are charging valid GST rates matching their HSN codes.
* **Consumer Court:** Learn how to file digital grievances on the National Consumer Helpline (NCH) for faulty goods.
`
    },
    {
      section_type: 'roadmap',
      title: 'Civic Finance Roadmap',
      content_json: [
        { phase: 'Phase 1: Tax Basics', description: 'Understand standard deductions, tax regimes, and forms (Form 16 / 26AS).' },
        { phase: 'Phase 2: Civic Awareness', description: 'Learn how public funds are spent by reading municipal budgets.' }
      ]
    },
    {
      section_type: 'faq',
      title: 'Frequently Asked Questions',
      content_json: [
        { q: 'Is GST mandatory for freelancers?', a: 'Only if annual turnover crosses ₹20 Lakhs (or ₹10 Lakhs in specific states).' }
      ]
    }
  ]
}
