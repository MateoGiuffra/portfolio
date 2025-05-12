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
        "Personalized chatbot consuming OpenAI API to generate inteligents answers. Ideal to show how to integrate a IA like ChatGPT in a real app.",
        ""
    ),
    new Proyect(
        "Telegram Bot",
        "images/telegram-logo.svg",
        ["Google Sheets API", "Python", "Telegram API", "OCR"],
        "https://github.com/MateoGiuffra/finance-bot",
        "Finance mananger. It uses the Google Sheets API to store and retrieve data, the Telegram API to interact with users, and OCR to extract text from images.",
        ""
    ),
    new Proyect(
        "AutoGS",
        "images/autogs.avif",
        ["Flask", "Python", "Firebase", "Selenium"],
        "https://github.com/MateoGiuffra/autogs",
        "This is a web app that allows obtain finance resume from a external page. It uses Flask in backend, Firebase to store data and Selenium to scrape the data from the external page.",
        ""
    ),
    new Proyect(
        "Kongo Scrapper",
        "images/kongo.avif",
        ["Google Sheets API", "Python", "Telegram API", "OCR"],
        "https://github.com/MateoGiuffra/web-scrapping-kotk",
        "Scraper built in Python that extracts product information from the site kingofthekongo.com.ar, saving the data in structured .json files. This project can be useful for price analysis, stock monitoring, product comparisons, or other automated purposes.",
        ""
    ),
]