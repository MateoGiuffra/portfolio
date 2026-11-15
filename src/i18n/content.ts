import type { CvFiles, LangContent, Links, Localized } from '../domain/types'

// Contenido bilingüe del portfolio. Toda la copy vive acá.
export const LINKS: Links = {
  github: 'https://github.com/MateoGiuffra',
  linkedin: 'https://www.linkedin.com/in/mateo-giuffra-023682289/',
  email: 'mailto:matteogiuffrah40@gmail.com',
}

export const CV_FILES: CvFiles = {
  es: 'files/CV-Mateo-Giuffra-ES.docx',
  en: 'files/CV-Mateo-Giuffra-EN.docx',
}

export const content: Localized<LangContent> = {
  es: {
    htmlLang: 'es',
    skip: 'Ir al contenido',
    nav: {
      work: 'Cómo trabajo',
      experience: 'Experiencia',
      projects: 'Proyectos',
      skills: 'Habilidades',
      contact: 'Contacto',
      menu: 'Menú',
      close: 'Cerrar',
      talk: 'Hablemos',
    },
    langToggle: { label: 'Cambiar idioma a inglés', short: 'EN' },
    hero: {
      title: 'Arquitectura de software y soluciones con IA',
      text:
        'Soy Mateo Giuffra, desarrollador en Mobeats Global. Diseño sistemas completos y los dejo listos ' +
        'para que los agentes de IA los extiendan sin romper las reglas del proyecto.',
      cv: 'Descargar CV',
      contact: 'Escribime',
      diagramLabel:
        'Diagrama de arquitectura hexagonal: un dominio central rodeado de puertos y adaptadores, ' +
        'dentro de un anillo de harness con tests de arquitectura, hooks y CI.',
      core: 'Dominio',
      adapters: ['REST', 'Base de datos', 'Mensajería', 'Agentes IA', 'Web', 'APIs externas'],
      harness: 'Harness: tests de arquitectura, hooks y CI',
    },
    work: {
      title: 'Cómo trabajo',
      items: [
        {
          title: 'Arquitectura que se verifica',
          text:
            'Clean y hexagonal, con tests de arquitectura que rompen el build cuando alguien cruza una capa, ' +
            'sea una persona o un agente.',
        },
        {
          title: 'IA con reglas',
          text:
            'Harnesses, hooks y skills a medida, agentes con roles definidos y servidores MCP propios para ' +
            'las herramientas del equipo.',
        },
        {
          title: 'Del código a producción',
          text:
            'Docker, CI/CD y GitOps con ArgoCD, Kustomize y Terraform. Certificado AWS Cloud Practitioner.',
        },
      ],
    },
    experience: {
      title: 'Experiencia y formación',
      company: 'Mobeats Global',
      role: 'Desarrollador Junior',
      period: 'Abril 2026 – Actualidad',
      startLabel: 'Inicio',
      start: 'Abr 2026',
      endLabel: 'Ahora',
      end: 'Actualidad',
      ongoing: 'En curso',
      unit: ['mes', 'meses'],
      tagline: 'AI software factory',
      badge: 'AWS Select Tier Partner',
      site: 'mobeats.io',
      siteUrl: 'https://www.mobeats.io/',
      stats: [
        ['14+', 'años construyendo software'],
        ['80+', 'proyectos en producción'],
      ],
      bullets: [
        'Diseño harnesses para que los agentes de IA programen dentro de las reglas del proyecto: tests de arquitectura, hooks y CI frenan lo que las rompe.',
        'Coordino varios agentes con roles y áreas separadas bajo un agente padre, sin que se pisen.',
        'Creo skills y servidores MCP a medida, como el de OpenProject, que automatizan tareas repetitivas y suman capacidades según mi uso.',
        'Aplico SDD con Speckit, Gentle AI y Engram: de la especificación al código.',
        'Backend en .NET (C#) y Node.js (Fastify), desplegado con Docker, Portainer y GitOps.',
        'RAG, modelos locales con Ollama y Amazon Bedrock.',
      ],
      educationTitle: 'Formación',
      education: [
        {
          name: 'Tecnicatura Universitaria en Programación',
          where: 'Universidad Nacional de Quilmes (UNQ)',
          period: '2022 – Actualidad (último año)',
          kind: 'Carrera',
          mark: 'UNQ',
          progress: 0.9,
          progressLabel: 'Último año',
          tags: ['POO', 'Estructuras de datos', 'Concurrencia', 'Patrones de diseño', 'SQL · NoSQL · Grafos', 'SO y redes'],
        },
        {
          name: 'AWS Certified Cloud Practitioner',
          where: 'Amazon Web Services',
          period: '2026',
          kind: 'Certificación',
          mark: 'AWS',
          tags: ['Cloud', 'Seguridad', 'Precios y facturación'],
        },
      ],
    },
    projects: {
      title: 'Proyectos',
      lead: 'Una selección de APIs, SDKs y herramientas que construí de punta a punta.',
      code: 'Código',
      view: 'Ver',
      demo: 'Demo',
      items: [
        {
          title: 'Qoodle Suite',
          text:
            'Monorepo con un SDK publicado en npm, un servidor MCP y una API REST con Swagger para leer ' +
            'cursos, foros y tareas del campus mediante login SAML.',
          stack: ['TypeScript', 'Node.js', 'MCP', 'SAML', 'pnpm'],
          code: 'https://github.com/MateoGiuffra/qoodle-suite',
        },
        {
          title: 'Meet Automation',
          text:
            'Bot que entra solo a una reunión de Google Meet dentro de una ventana horaria, con micrófono y ' +
            'cámara apagados, y sale cuando un juez LLM detecta que la clase terminó.',
          stack: ['TypeScript', 'LLM'],
          code: 'https://github.com/MateoGiuffra/meet-automation',
        },
        {
          title: 'E-commerce Data Analysis',
          text:
            'API para analizar datos de e-commerce con autenticación segura, tareas en segundo plano con ' +
            'Celery y caché con Redis.',
          stack: ['Python', 'FastAPI', 'Celery', 'Redis'],
          code: 'https://github.com/MateoGiuffra/ecommerce-data-analysis-api',
        },
        {
          title: 'Football API',
          text:
            'API REST de datos de fútbol con scraping concurrente, caché, tareas programadas y JWT en cookie. ' +
            'Arquitectura por capas y tests con Mockito.',
          stack: ['Java', 'Spring Boot', 'Spring Security', 'Docker'],
          code: 'https://github.com/MateoGiuffra/DesApp-grupo-J',
          demo: 'https://football-unq.onrender.com',
        },
        {
          title: 'User Management API',
          text:
            'Gestión de usuarios con Clean Architecture, JWT en cookies HttpOnly, migraciones con Alembic, ' +
            'Docker multi-stage y tests con Pytest.',
          stack: ['Python', 'FastAPI', 'SQLAlchemy', 'Docker'],
          code: 'https://github.com/MateoGiuffra/fastapi-api-rest',
          demo: 'https://fastapi-api-rest-8jle.onrender.com/docs',
        },
        {
          title: 'Simulador Von Neumann',
          text:
            'Simulador web del ciclo de instrucción y de la pila: tabla editable, parser de instrucciones y ' +
            'ejecución paso a paso. Hecho para Organización de Computadoras (UNQ).',
          stack: ['React', 'JavaScript'],
          code: 'https://github.com/MateoGiuffra/tabla-de-pila',
          demo: 'https://simulador-de-pila.vercel.app/',
        },
        {
          title: 'Epergeist',
          text:
            'Backend que integra Neo4j, MongoDB, Firebase y MySQL en un mismo dominio, con Spring WebFlux ' +
            'para el flujo reactivo. Trabajo final de Estrategias de Persistencia (UNQ).',
          stack: ['Java', 'Spring WebFlux', 'Neo4j', 'MongoDB'],
          code: 'https://github.com/MateoGiuffra/EPERS---Estrategias-de-Persistencia',
        },
      ],
    },
    skills: {
      title: 'Habilidades',
      groups: [
        ['Arquitectura', 'Clean Architecture, arquitectura hexagonal (Ports and Adapters), SOLID, patrones de diseño, arquitectura por capas, MVC, multi-tenancy (multitenant), REST, SDD, ODD'],
        ['IA', 'AI Agents, Multi-Agent Orchestration, Harness, Skills, Hooks, MCP (Model Context Protocol, MCP Servers), Claude Code, LLM, Prompt Engineering, RAG (Retrieval-Augmented Generation), Ollama, Amazon Bedrock, HITL (Human-in-the-Loop)'],
        ['Backend', '.NET (ASP.NET Core), C#, Kotlin, Node.js (NestJS, Express, Fastify), Java (Spring Boot), Python (FastAPI, Flask), PHP (Laravel), JWT'],
        ['Frontend', 'TypeScript, JavaScript, React (React.js, ReactJS), Next.js, Angular, Astro, Svelte, HTML, CSS, Tailwind CSS'],
        ['Mobile', 'Flutter (Dart), React Native, iOS, Android'],
        ['Datos', 'PostgreSQL, MySQL, MariaDB, MongoDB, Firebase (Firestore), SQL'],
        ['Cloud y DevOps', 'AWS, Terraform, ArgoCD, Kustomize, CI/CD, GitHub Actions'],
        ['Testing', 'TDD, Pytest, JUnit, Mockito, ArchUnit, NetArchTest, ArchUnitNET, dependency-cruiser, integración y e2e'],
        ['Control de versiones', 'Git, GitHub, GitLab, Bitbucket'],
      ],
    },
    contact: {
      title: 'Contacto',
      text: 'Si tenés un proyecto o una vacante, escribime.',
      name: 'Nombre',
      email: 'Email',
      message: 'Mensaje',
      send: 'Enviar mensaje',
      sending: 'Enviando…',
      sent: 'Mensaje enviado',
      error: 'No se pudo enviar el mensaje. Probá de nuevo o escribime por email.',
      emailLink: 'Escribir por email',
    },
    footer: 'Mateo Giuffra. Buenos Aires, Argentina.',
  },

  en: {
    htmlLang: 'en',
    skip: 'Skip to content',
    nav: {
      work: 'How I work',
      experience: 'Experience',
      projects: 'Projects',
      skills: 'Skills',
      contact: 'Contact',
      menu: 'Menu',
      close: 'Close',
      talk: "Let's talk",
    },
    langToggle: { label: 'Switch language to Spanish', short: 'ES' },
    hero: {
      title: 'Software architecture and AI solutions',
      text:
        "I'm Mateo Giuffra, a developer at Mobeats Global. I design complete systems and leave them ready " +
        'for AI agents to extend without breaking the project rules.',
      cv: 'Download CV',
      contact: 'Get in touch',
      diagramLabel:
        'Hexagonal architecture diagram: a central domain surrounded by ports and adapters, ' +
        'inside a harness ring with architecture tests, hooks and CI.',
      core: 'Domain',
      adapters: ['REST', 'Database', 'Messaging', 'AI agents', 'Web', 'External APIs'],
      harness: 'Harness: architecture tests, hooks and CI',
    },
    work: {
      title: 'How I work',
      items: [
        {
          title: 'Architecture that gets verified',
          text:
            'Clean and hexagonal, with architecture tests that break the build when someone crosses a layer, ' +
            'whether a person or an agent.',
        },
        {
          title: 'AI with rules',
          text:
            'Custom harnesses, hooks and skills, agents with defined roles and my own MCP servers for the ' +
            "team's tools.",
        },
        {
          title: 'From code to production',
          text:
            'Docker, CI/CD and GitOps with ArgoCD, Kustomize and Terraform. AWS Certified Cloud Practitioner.',
        },
      ],
    },
    experience: {
      title: 'Experience and education',
      company: 'Mobeats Global',
      role: 'Junior Developer',
      period: 'April 2026 – Present',
      startLabel: 'Start',
      start: 'Apr 2026',
      endLabel: 'Now',
      end: 'Present',
      ongoing: 'Ongoing',
      unit: ['month', 'months'],
      tagline: 'AI software factory',
      badge: 'AWS Select Tier Partner',
      site: 'mobeats.io',
      siteUrl: 'https://www.mobeats.io/',
      stats: [
        ['14+', 'years building software'],
        ['80+', 'projects in production'],
      ],
      bullets: [
        "I design harnesses so AI agents code within the project's rules: architecture tests, hooks and CI stop whatever breaks them.",
        'I coordinate several agents with separate roles and areas under a parent agent, so they never collide.',
        'I create custom skills and MCP servers, such as the OpenProject one, that automate repetitive tasks and add capabilities as I need them.',
        'I apply SDD with Speckit, Gentle AI and Engram: from specification to code.',
        'Backend in .NET (C#) and Node.js (Fastify), deployed with Docker, Portainer and GitOps.',
        'RAG, local models with Ollama and Amazon Bedrock.',
      ],
      educationTitle: 'Education',
      education: [
        {
          name: 'University Technical Degree in Programming',
          where: 'Universidad Nacional de Quilmes (UNQ)',
          period: '2022 – Present (final year)',
          kind: 'Degree',
          mark: 'UNQ',
          progress: 0.9,
          progressLabel: 'Final year',
          tags: ['OOP', 'Data structures', 'Concurrency', 'Design patterns', 'SQL · NoSQL · Graphs', 'OS & networks'],
        },
        {
          name: 'AWS Certified Cloud Practitioner',
          where: 'Amazon Web Services',
          period: '2026',
          kind: 'Certification',
          mark: 'AWS',
          tags: ['Cloud', 'Security', 'Pricing & billing'],
        },
      ],
    },
    projects: {
      title: 'Projects',
      lead: 'A selection of APIs, SDKs and tools I built end to end.',
      code: 'Code',
      view: 'View',
      demo: 'Demo',
      items: [
        {
          title: 'Qoodle Suite',
          text:
            'Monorepo with an npm-published SDK, an MCP server and a REST API with Swagger to read courses, ' +
            'forums and assignments from the campus through SAML login.',
          stack: ['TypeScript', 'Node.js', 'MCP', 'SAML', 'pnpm'],
          code: 'https://github.com/MateoGiuffra/qoodle-suite',
        },
        {
          title: 'Meet Automation',
          text:
            'Bot that joins a Google Meet on its own within a time window, with microphone and camera off, ' +
            'and leaves when an LLM judge detects the class has ended.',
          stack: ['TypeScript', 'LLM'],
          code: 'https://github.com/MateoGiuffra/meet-automation',
        },
        {
          title: 'E-commerce Data Analysis',
          text:
            'API to analyze e-commerce data with secure authentication, background tasks with Celery and ' +
            'caching with Redis.',
          stack: ['Python', 'FastAPI', 'Celery', 'Redis'],
          code: 'https://github.com/MateoGiuffra/ecommerce-data-analysis-api',
        },
        {
          title: 'Football API',
          text:
            'Football data REST API with concurrent scraping, caching, scheduled tasks and cookie-based JWT. ' +
            'Layered architecture and Mockito tests.',
          stack: ['Java', 'Spring Boot', 'Spring Security', 'Docker'],
          code: 'https://github.com/MateoGiuffra/DesApp-grupo-J',
          demo: 'https://football-unq.onrender.com',
        },
        {
          title: 'User Management API',
          text:
            'User management with Clean Architecture, HttpOnly cookie JWT, Alembic migrations, multi-stage ' +
            'Docker and Pytest tests.',
          stack: ['Python', 'FastAPI', 'SQLAlchemy', 'Docker'],
          code: 'https://github.com/MateoGiuffra/fastapi-api-rest',
          demo: 'https://fastapi-api-rest-8jle.onrender.com/docs',
        },
        {
          title: 'Von Neumann Simulator',
          text:
            'Web simulator of the instruction cycle and the stack: editable table, instruction parser and ' +
            'step-by-step execution. Built for Computer Organization (UNQ).',
          stack: ['React', 'JavaScript'],
          code: 'https://github.com/MateoGiuffra/tabla-de-pila',
          demo: 'https://simulador-de-pila.vercel.app/',
        },
        {
          title: 'Epergeist',
          text:
            'Backend that integrates Neo4j, MongoDB, Firebase and MySQL in one domain, with Spring WebFlux ' +
            'for the reactive flow. Final project for Persistence Strategies (UNQ).',
          stack: ['Java', 'Spring WebFlux', 'Neo4j', 'MongoDB'],
          code: 'https://github.com/MateoGiuffra/EPERS---Estrategias-de-Persistencia',
        },
      ],
    },
    skills: {
      title: 'Skills',
      groups: [
        ['Architecture', 'Clean Architecture, hexagonal architecture (Ports and Adapters), SOLID, design patterns, layered architecture, MVC, multi-tenancy (multitenant), REST, SDD, ODD'],
        ['AI', 'AI Agents, Multi-Agent Orchestration, Harness, Skills, Hooks, MCP (Model Context Protocol, MCP Servers), Claude Code, LLM, Prompt Engineering, RAG (Retrieval-Augmented Generation), Ollama, Amazon Bedrock, HITL (Human-in-the-Loop)'],
        ['Backend', '.NET (ASP.NET Core), C#, Kotlin, Node.js (NestJS, Express, Fastify), Java (Spring Boot), Python (FastAPI, Flask), PHP (Laravel), JWT'],
        ['Frontend', 'TypeScript, JavaScript, React (React.js, ReactJS), Next.js, Angular, Astro, Svelte, HTML, CSS, Tailwind CSS'],
        ['Mobile', 'Flutter (Dart), React Native, iOS, Android'],
        ['Data', 'PostgreSQL, MySQL, MariaDB, MongoDB, Firebase (Firestore), SQL'],
        ['Cloud and DevOps', 'AWS, Terraform, ArgoCD, Kustomize, CI/CD, GitHub Actions'],
        ['Testing', 'TDD, Pytest, JUnit, Mockito, ArchUnit, NetArchTest, ArchUnitNET, dependency-cruiser, integration and e2e'],
        ['Version control', 'Git, GitHub, GitLab, Bitbucket'],
      ],
    },
    contact: {
      title: 'Contact',
      text: 'If you have a project or an opening, write to me.',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send message',
      sending: 'Sending…',
      sent: 'Message sent',
      error: "The message couldn't be sent. Try again or write to me by email.",
      emailLink: 'Write by email',
    },
    footer: 'Mateo Giuffra. Buenos Aires, Argentina.',
  },
}
