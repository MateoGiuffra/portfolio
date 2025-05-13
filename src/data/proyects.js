class Proyect {
    constructor(title, src, tags, linkToGithub, description, moreInfo) {
        this.title = title;
        this.src = src;
        this.tags = tags;
        this.linkToGithub = linkToGithub;
        this.description = description;
        this.moreInfo = moreInfo;
    }
}
export const proyects = [
    new Proyect(
        "ChatBot",
        "images/chatbot.avif",
        ["JavaScript", "Python", "React", "Flask"],
        "https://github.com/MateoGiuffra/chatbot-app",
        "Personalized chatbot consuming OpenAI API to generate intelligent answers. Ideal to demonstrate how to integrate an AI like ChatGPT into a real app.",
        [
            "The user writes a prompt through an interactive front-end",
            "Using JavaScript, we capture the message and consume the Flask API with axios",
            "The Flask API validates the data and sends it to its service",
            "The service is responsible for consuming the OpenAI API and obtaining the formatted response"
        ]
    ),
    new Proyect(
        "Telegram Bot",
        "images/telegram-logo.svg",
        ["Google Sheets API", "Python", "Telegram API", "OCR"],
        "https://github.com/MateoGiuffra/finance-bot",
        "Finance manager. It uses the Google Sheets API to store and retrieve data, the Telegram API to interact with users, and OCR to extract text from images.",
        [
            "The user sends a photo of a ticket or receipt through Telegram",
            "The bot receives the image and processes it using OCR to extract text data",
            "Parsed data includes total amount, vendor name, and date of purchase",
            "The bot categorizes the expense and stores it into the appropriate sheet in Google Sheets",
            "Users can request summaries or specific queries through simple Telegram commands"
        ]
    ),
    new Proyect(
        "AutoGS",
        "images/autogs.avif",
        ["Flask", "Python", "Firebase", "Selenium"],
        "https://github.com/MateoGiuffra/autogs",
        "This is a web app that allows obtaining a financial summary from an external page. Use Selenium to scrape the data from the external page.",
        [
            "The user accesses the web interface and logs in",
            "After authentication, they trigger the scraping process by clicking a button",
            "Selenium navigates the target financial site and extracts the required information",
            "The data is processed and uploaded to Firebase for persistent storage",
            "The front-end renders the summarized data using Flask routes and templates"
        ]
    ),
    new Proyect(
        "Kongo Scraper",
        "images/kongo.avif",
        ["Google Sheets API", "Python", "Telegram API", "OCR"],
        "https://github.com/MateoGiuffra/web-scrapping-kotk",
        "Scraper built in Python that extracts product information from the site kingofthekongo.com.ar, saving the data in structured .json files.",
        [
            "The scraper is executed via CLI or scheduled task",
            "It accesses the e-commerce site and navigates through product listings",
            "Each product's name, price, and availability are extracted",
            "The structured information is stored in .json files for easy access",
            "Can be extended to update Google Sheets or integrate with a Telegram bot for alerts"
        ]
    ),
];
