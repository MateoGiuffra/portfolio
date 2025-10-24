class Proyect {
    constructor(title, src, tags, linkToGithub, description, moreInfo, srcBackImage) {
        this.title = title;
        this.src = src;
        this.tags = tags;
        this.linkToGithub = linkToGithub;
        this.description = description;
        this.moreInfo = moreInfo;
        this.srcBackImage = srcBackImage;
    }
}
export const proyects = [
    // new Proyect(
    //     "ChatBot",
    //     "images/chatbot.avif",
    //     ["JavaScript", "Python", "React", "Flask"],
    //     "https://github.com/MateoGiuffra/chatbot-app",
    //     "Personalized chatbot consuming OpenAI API to generate intelligent answers. Ideal to demonstrate how to integrate an AI like ChatGPT into a real app.",
    //     [
    //         "The user writes a prompt through an interactive front-end",
    //         "Using JavaScript, we capture the message and consume the Flask API with axios",
    //         "The Flask API validates the data and sends it to its service",
    //         "The service is responsible for consuming the OpenAI API and obtaining the formatted response"
    //     ],
    //     "images/chatbotBackImage.avif"
    // ),

    new Proyect(
        "FastAPI User Management API",
        "images/fastapi.avif",
        ["Python", "FastAPI", "SQLAlchemy", "Alembic", "Docker", "Pytest", "JWT", "bcrypt"],
        "https://fastapi-api-rest-8jle.onrender.com/docs",
        "A robust and scalable REST API for user management built with FastAPI. Clean Architecture with separated layers (Routers, Services, Repositories), secure JWT authentication via HttpOnly cookies, SQLAlchemy ORM and Alembic migrations, containerized for production and fully tested.",
        [
            "Secure JWT-based authentication stored in HttpOnly cookies (protects against XSS)",
            "Clean Architecture: Routers, Services, Repositories and dependency injection",
            "Database interactions with SQLAlchemy and migrations managed by Alembic",
            "Multi-stage Dockerfile for lightweight production images",
            "Comprehensive unit and integration test suite with Pytest",
            "Built-in pagination and input validation"
        ],
        "images/fastapiBackImage.avif"
    ),
    new Proyect(
        "Football API",
        "images/football.avif",
        ["Java", "Spring Boot", "JPA", "Spring Security", "Mockito", "Docker", "AOP", "Caching"],
        "https://football-unq.onrender.com",
        "Spring Boot REST API for football data (teams, players) implementing Clean Architecture. Integrates WhoScored scraping, scheduling, caching and cookie+JWT authentication. Includes tests (Mockito), AOP-based endpoint logging and CI/CD-ready configuration.",
        [
            "Proxy-based HTTP fetching and WhoScored scraping/parsing utilities",
            "Concurrent scraping of players using thread pools and futures for performance",
            "AOP aspect that logs endpoint accesses and a service/controller for endpoint logs",
            "Authentication via cookies + JWT, integrated with Spring Security",
            "Caching and scheduled tasks (e.g., periodic data refresh every 4 hours)",
            "Unit and integration tests with Mockito and CI/CD pipelines for deployment"
        ],
        "images/footballBackImage.avif"
    ),

    new Proyect(
        "Simulador Von Neumann - UNQ",
        "images/von_neumann.avif",
        ["React", "JavaScript", "HTML", "CSS", "Vercel"],
        "https://github.com/MateoGiuffra/tabla-de-pila",
        "Web application that simulates the instruction cycle and stack behavior in a Von Neumann architecture. Developed for the 'Organización de Computadoras' course at Universidad Nacional de Quilmes. Live demo available on Vercel.",
        [
            "Editable spreadsheet-like table with columns: PC, IR, PC-BI, Instruction, Dest, Orig, Stack, SP, PC-EX",
            "Automatic instruction parser: write into IR and the system auto-fills related fields",
            "Real-time validations (e.g., PC-BI must equal PC + instruction_size)",
            "Step-by-step simulator: FETCH → DECODE → EXECUTE → WRITEBACK",
            "Keyboard shortcuts for productivity, dark/light theme with optional Monokai",
            "Export/Import in multiple formats (PDF, PNG, JSON, CSV) and full Undo/Redo history",
            "Supported instructions: MOV, ADD, SUB, MUL, DIV, PUSH, POP, CALL, RET, JMP, CMP, JE, JNE, JG, JL, NOP",
            "Repo and demo: https://github.com/MateoGiuffra/tabla-de-pila  •  https://simulador-de-pila.vercel.app/"
        ],
        "images/von_neumannBackImage.avif"
    ),
    new Proyect(
        "Epergeist",
        "images/epergeist.avif",
        ["Spring", "Spring Boot", "Spring WebFlux", "Java", "SQL", "NoSQL"],
        "https://github.com/MateoGiuffra/EPERS---Estrategias-de-Persistencia?tab=readme-ov-file",
        "A full backend project that explores integrating multiple persistence mechanisms in a fictional domain where Spirits, Mediums, and Locations interact.",
        [
            "Neo4j: Used for graph traversal and relationships between spirits and mediums via Cypher",
            "MongoDB: Used for geospatial queries on location data",
            "Firebase: Realtime data persistence and reactive updates using WebFlux",
            "MySQL: Stores structured entities",
            "Spring WebFlux: Handles reactive programming and asynchronous data flow",
        ],
        "images/epergeistBackImage.avif"
    ),
];



// export const proyects = proyectsA.map(proj => {
//     // Only update if not already starting with "portfolio/"
//     const updatePath = path => path && !path.startsWith("portfolio/") ? `portfolio/${path}` : path;
//     return new Proyect(
//         proj.title,
//         updatePath(proj.src),
//         proj.tags,
//         proj.linkToGithub,
//         proj.description,
//         proj.moreInfo,
//         updatePath(proj.srcBackImage)
//     );
// });
