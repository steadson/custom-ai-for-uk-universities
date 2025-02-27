import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";
import { Mistral } from "@mistralai/mistralai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { title } from "process";
import { parseFallbackField } from "next/dist/lib/fallback";

// Custom interfaces
interface PageContent {
    content: string;
    title: string;
}

interface ChunkData {
    text: string;
    schoolName: string;
    pageTitle: string;
    url: string;
}

// Environment variables
const {
    ASTRA_DB_NAMESPACE2,
    ASTRA_DB_COLLECTION2,
    ASTRA_DB_API_ENDPOINT2,
    ASTRA_DB_APPLICATION_TOKEN2,
    OPENAI_API_KEY,
    MISTRAL_API_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY1
} = process.env;

const genAI = new GoogleGenerativeAI(GOOGLE_GENERATIVE_AI_API_KEY1 as string);

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"
const f1Data = [
    "https://www.abdn.ac.uk/study/postgraduate-taught/degree-programmes/1198/data-science/",
    "https://www.abdn.ac.uk/study/postgraduate-taught/degree-programmes/133/information-technology/",
    "https://www.abdn.ac.uk/study/postgraduate-taught/degree-programmes/1034/artificial-intelligence/",
    "https://www.abdn.ac.uk/study/postgraduate-taught/degree-programmes/2020/information-technology-with-cybersecurity/",
    "https://www.abdn.ac.uk/study/postgraduate-taught/degree-programmes/1846/cybersecurity/",
    "https://www.abdn.ac.uk/study/postgraduate-taught/degree-programmes/1849/industrial-robotics/",
    "https://www.thecompleteuniversityguide.co.uk/universities/university-of-aberdeen",
    "https://courses.aber.ac.uk/postgraduate/computer-science-software-engineering-masters/",
    "https://courses.aber.ac.uk/postgraduate/software-engineering-integrated-industrial-year/",
    "https://courses.aber.ac.uk/postgraduate/computer-science-msc/",
    "https://courses.aber.ac.uk/postgraduate/artificial-intelligence-msc/",
    "https://courses.aber.ac.uk/postgraduate/masters-data-science/",
    "https://www.thecompleteuniversityguide.co.uk/universities/aberystwyth-university",
    "https://www.ulster.ac.uk/courses/202526/computer-science-37151",
    "https://www.ulster.ac.uk/courses/202526/computer-science-37152",
    "https://www.ulster.ac.uk/courses/202526/computer-science-with-industrial-placement-39206",
    "https://www.thecompleteuniversityguide.co.uk/universities/ulster-university",
    "https://www.hw.ac.uk/study/postgraduate/computer-science-for-cyber-security",
    "https://www.hw.ac.uk/study/postgraduate/data-science",
    "https://www.hw.ac.uk/study/postgraduate/data-science-2-years",
    "https://www.hw.ac.uk/study/postgraduate/software-engineering",
    "https://www.hw.ac.uk/study/postgraduate/artificial-intelligence",
    "https://www.hw.ac.uk/study/postgraduate/applied-cybersecurity",
    "https://www.hw.ac.uk/study/postgraduate/artificial-intelligence-2-years",
    "https://www.hw.ac.uk/study/postgraduate/games-design-development",
    "https://www.thecompleteuniversityguide.co.uk/universities/heriot-watt-university",
    "https://www.ntu.ac.uk/course/science-and-technology/pg/msc-computer-science",
    "https://www.thecompleteuniversityguide.co.uk/universities/nottingham-trent-university",
    "https://www.ntu.ac.uk/course/science-and-technology/pg/msc-data-science",
    "https://www.brookes.ac.uk/courses/postgraduate/computer-science-for-cyber-security",
    "https://www.brookes.ac.uk/courses/postgraduate/data-science-and-artificial-intelligence",
    "https://www.brookes.ac.uk/courses/postgraduate/computing",
    "https://www.thecompleteuniversityguide.co.uk/universities/oxford-brookes-university",
    "https://www.thecompleteuniversityguide.co.uk/universities/university-of-sussex",
   "https://www.thecompleteuniversityguide.co.uk/universities/university-of-lincoln",
     "https://www.st-andrews.ac.uk/subjects/computer-science/software-engineering-msc/",
    "https://www.st-andrews.ac.uk/subjects/computer-science/data-science/",
    "https://www.postgraduate.study.cam.ac.uk/courses/directory/cscsmpacs",
    "https://www.postgraduate.study.cam.ac.uk/courses/directory/cscsmpacs/study",
    "https://www.postgraduate.study.cam.ac.uk/courses/directory/cscsmpacs/requirements",
    "https://www.postgraduate.study.cam.ac.uk/courses/directory/cscsmpacs/finance",
    "https://www.postgraduate.study.cam.ac.uk/courses/directory/cscsmpacs/apply",
    "https://www.ox.ac.uk/admissions/graduate/courses/msc-software-engineering",
    "https://www.ox.ac.uk/admissions/graduate/courses/msc-advanced-computer-science",
    "https://www.st-andrews.ac.uk/subjects/computer-science/computer-science-msc/",
    "https://www.st-andrews.ac.uk/subjects/computer-science/artificial-intelligence-msc/",
    "https://www.birmingham.ac.uk/study/postgraduate/subjects/computer-science-and-data-science-courses/advanced-computer-science-msc",
    "https://www.exeter.ac.uk/study/postgraduate/courses/computerscience/compscimsc/",
    "https://search.exeter.ac.uk/s/redirect?collection=uoe~sp-search&url=https%3A%2F%2Fwww.exeter.ac.uk%2Fstudy%2Fpostgraduate%2Fcourses%2Fcomputerscience%2Fcomputer-science%2F&auth=2bzgmNom1Tahoe%2BQC%2FB9kQ&profile=_default&rank=2&query=computer+science",
    "https://postgraduate.degrees.ed.ac.uk/index.php?r=site/view&edition=2025&id=110",
    "https://www.manchester.ac.uk/study/masters/courses/list/21573/msc-advanced-computer-science/",
    "https://www.qub.ac.uk/home/courses/postgraduate-taught/artificial-intelligence-msc/",
    "https://www.ncl.ac.uk/postgraduate/degrees/5178f/",
    "https://www.ncl.ac.uk/postgraduate/degrees/5055f/",
    "https://www.cardiff.ac.uk/study/postgraduate/taught/courses/course/advanced-computer-science-msc-full-time-september-start",
    "https://www.gla.ac.uk/postgraduate/taught/computingscience/",
    "https://www.nottingham.ac.uk/pgstudy/course/taught/computer-science-or-computer-science-artificial-intelligence-msc",
    "https://www.southampton.ac.uk/courses/computer-science-masters-msc",
    "https://www.bristol.ac.uk/study/postgraduate/taught/msc-computer-science-conversion/",
    "https://www.bristol.ac.uk/study/postgraduate/taught/msc-scientific-computing-with-data-science/",
    "https://www.york.ac.uk/study/postgraduate-taught/courses/msc-advanced-computer-science/",
    "https://online.york.ac.uk/study-online/msc-computer-science-with-artificial-intelligence-online/",
    "https://www.york.ac.uk/study/postgraduate-taught/courses/msc-artificial-intelligence/",
    "https://www.sheffield.ac.uk/postgraduate/taught/courses/2025/advanced-computer-science-msc",
    "https://www.sheffield.ac.uk/postgraduate/taught/courses/2025/artificial-intelligence-msc",
    "https://www.liverpool.ac.uk/courses/2025/computer-science-msc?_gl=1*umpcxk*_up*MQ..*_ga*MTAxMzY0NDUwLjE3MzkyMzMyOTc.*_ga_D5RC5GKKXW*MTczOTIzMzI5Ni4xLjEuMTczOTIzMzM0OC4wLjAuMA..",
    "https://www.uea.ac.uk/course/postgraduate/msc-computing-science",
    "https://www.uea.ac.uk/course/postgraduate/msc-advanced-computing-science",
    "https://courses.leeds.ac.uk/f753/advanced-computer-science-msc",
    "https://courses.leeds.ac.uk/i537/advanced-computer-science-artificial-intelligence-msc",
   "https://www.kcl.ac.uk/study/postgraduate-taught/courses/advanced-computing-msc",
    "https://www.abdn.ac.uk/study/postgraduate-taught/degree-programmes/1198/data-science/",
    "https://www.abdn.ac.uk/study/postgraduate-taught/degree-programmes/133/information-technology/",
    "https://www.abdn.ac.uk/study/postgraduate-taught/degree-programmes/1034/artificial-intelligence/",
    "https://www.abdn.ac.uk/study/postgraduate-taught/degree-programmes/2020/information-technology-with-cybersecurity/",
    "https://www.abdn.ac.uk/study/postgraduate-taught/degree-programmes/1846/cybersecurity/",
    "https://www.abdn.ac.uk/study/postgraduate-taught/degree-programmes/1849/industrial-robotics/",
    "https://www.thecompleteuniversityguide.co.uk/universities/university-of-aberdeen",
    "https://courses.aber.ac.uk/postgraduate/computer-science-software-engineering-masters/",
    "https://courses.aber.ac.uk/postgraduate/software-engineering-integrated-industrial-year/",
    "https://courses.aber.ac.uk/postgraduate/computer-science-msc/",
    "https://www.bath.ac.uk/courses/postgraduate-2025/taught-postgraduate-courses/msc-computer-science/",
    "https://online.bath.ac.uk/online-courses/msc-computer-science",
    "https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees/computer-science-msc",
    "https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees/machine-learning-msc",
    "https://www.lancaster.ac.uk/study/postgraduate/postgraduate-courses/computer-science-msc-by-research/2025/",
    "https://www.surrey.ac.uk/postgraduate/computer-vision-robotics-and-machine-learning-msc",
    "https://www.birmingham.ac.uk/study/postgraduate/subjects/computer-science-and-data-science-courses/computer-science-msc",
    "https://courses.aber.ac.uk/postgraduate/artificial-intelligence-msc/",
    "https://courses.aber.ac.uk/postgraduate/masters-data-science/",
    "https://www.thecompleteuniversityguide.co.uk/universities/aberystwyth-university",
    "https://www.ulster.ac.uk/courses/202526/computer-science-37151",
    "https://www.ulster.ac.uk/courses/202526/computer-science-37152",
    "https://www.ulster.ac.uk/courses/202526/computer-science-with-industrial-placement-39206",
    "https://www.thecompleteuniversityguide.co.uk/universities/ulster-university",
    "https://www.hw.ac.uk/study/postgraduate/computer-science-for-cyber-security",
    "https://www.hw.ac.uk/study/postgraduate/data-science",
    "https://www.imperial.ac.uk/study/courses/postgraduate-taught/2025/computing/",
    "https://www.imperial.ac.uk/study/courses/postgraduate-taught/2025/applied-computational-science/",
    "https://www.hw.ac.uk/study/postgraduate/data-science-2-years",
    "https://www.hw.ac.uk/study/postgraduate/software-engineering",
    "https://www.hw.ac.uk/study/postgraduate/artificial-intelligence",
    "https://www.hw.ac.uk/study/postgraduate/applied-cybersecurity",
    "https://www.hw.ac.uk/study/postgraduate/artificial-intelligence-2-years",
    "https://search.lboro.ac.uk/s/redirect?collection=loughborough-courses&url=https%3A%2F%2Fwww.lboro.ac.uk%2Fstudy%2Fpostgraduate%2Fmasters-degrees%2Fa-z%2Fcomputer-science%2F&auth=Mv4VQ8rwvq%2BKt0HvKMWNeA&profile=_default&rank=1&query=computer+science+%7C%5Blevel%3A%22%24%2B%2B+Master%27s+degrees+%24%2B%2B%22+level%3A%22%24%2B%2B+PhD+opportunities+%24%2B%2B%22%5D",
    "https://www.lboro.ac.uk/study/postgraduate/masters-degrees/a-z/artificial-intelligence/",
    "https://www.lboro.ac.uk/study/postgraduate/masters-degrees/a-z/data-science/",
    "https://www.lboro.ac.uk/study/postgraduate/masters-degrees/a-z/advanced-computer-science/",
    "https://www.durham.ac.uk/study/courses/advanced-computer-science-g5t609/",
    "https://www.durham.ac.uk/study/courses/advanced-computer-science-artificial-intelligence-g5t709/",
    "https://www.durham.ac.uk/study/courses/scientific-computing-and-data-analysis-computer-vision-and-robotics-g5t509/",

    "https://www.hw.ac.uk/study/postgraduate/games-design-development",
    "https://www.thecompleteuniversityguide.co.uk/universities/heriot-watt-university",
    "https://www.ntu.ac.uk/course/science-and-technology/pg/msc-computer-science",
    "https://www.thecompleteuniversityguide.co.uk/universities/nottingham-trent-university",
    "https://www.ntu.ac.uk/course/science-and-technology/pg/msc-data-science",
    "https://www.brookes.ac.uk/courses/postgraduate/computer-science-for-cyber-security",
    "https://www.brookes.ac.uk/courses/postgraduate/data-science-and-artificial-intelligence",
    "https://www.brookes.ac.uk/courses/postgraduate/computing",
    "https://www.thecompleteuniversityguide.co.uk/universities/oxford-brookes-university",
    "https://www.thecompleteuniversityguide.co.uk/universities/university-of-sussex",
    "https://www.sussex.ac.uk/study/masters/courses/advanced-artificial-intelligence-mres",
    "https://www.sussex.ac.uk/study/masters/courses/advanced-computer-science-msc",
    "https://www.sussex.ac.uk/study/masters/courses/artificial-intelligence-and-adaptive-systems-with-an-industrial-placement-year-msc",
    "https://www.sussex.ac.uk/study/masters/courses/artificial-intelligence-and-adaptive-systems-msc",
    "https://www.sussex.ac.uk/study/masters/courses/data-science-msc",
    "https://www.sussex.ac.uk/study/masters/courses/5g-mobile-communications-and-intelligent-embedded-systems-with-an-industrial-placement-year-msc",
    "https://www.thecompleteuniversityguide.co.uk/universities/university-of-lincoln",
    "https://www.port.ac.uk/study/courses/postgraduate-taught/msc-computer-science",
    "https://www.port.ac.uk/study/courses/postgraduate-taught/msc-computer-science#entry-requirements",
    "https://www.port.ac.uk/study/courses/postgraduate-taught/msc-computer-science#course-costs-and-funding",
    "https://www.port.ac.uk/study/courses/postgraduate-taught/msc-computer-science#modules",
    "https://www.port.ac.uk/study/courses/postgraduate-taught/msc-computer-science#apply",
    "https://www.thecompleteuniversityguide.co.uk/universities/university-of-portsmouth",
    "https://www.qmul.ac.uk/postgraduate/taught/coursefinder/courses/advanced-computer-science-msc/",
    "https://www.qmul.ac.uk/postgraduate/taught/coursefinder/courses/computer-science-conversion-msc/",
    "https://www.qmul.ac.uk/postgraduate/taught/coursefinder/courses/computer-games-msc/",
    "https://www.qmul.ac.uk/postgraduate/taught/coursefinder/courses/data-science-msc/",
    "https://www.qmul.ac.uk/postgraduate/taught/coursefinder/courses/computer-science-by-research-msc/",
    "https://www.qmul.ac.uk/postgraduate/taught/coursefinder/courses/data-science-and-artificial-intelligence-conversion-programme-msc/",
    "https://www.qmul.ac.uk/postgraduate/taught/coursefinder/courses/artificial-intelligence-msc/",
    "https://www.qmul.ac.uk/postgraduate/taught/coursefinder/courses/machine-learning-for-visual-data-analytics-msc/",
    "https://www.qmul.ac.uk/postgraduate/taught/coursefinder/courses/advanced-electronic-and-electrical-engineering-msc/",
    "https://www.qmul.ac.uk/postgraduate/taught/coursefinder/courses/electronic-engineering-by-research-msc/",
    "https://www.strath.ac.uk/courses/postgraduatetaught/advancedcomputersciencewithsoftwareengineering/",
    "https://www.strath.ac.uk/courses/postgraduatetaught/advancedcomputerscience/",
    "https://www.strath.ac.uk/courses/postgraduatetaught/advancedcomputersciencewithartificialintelligence/",
    "https://www.northumbria.ac.uk/study-at-northumbria/courses/msc-advanced-computer-science-16-months-dtfavb6/",
    "https://www.northumbria.ac.uk/study-at-northumbria/courses/msc-artificial-intelligence-technology-full-time-london-subject-to-validation-dtfarn6/",
    "https://le.ac.uk/courses/advanced-computer-science-msc",
    "https://le.ac.uk/courses/advanced-software-engineering-msc",
    "https://www.swansea.ac.uk/postgraduate/taught/science/computer-science/msc-advanced-computer-science/",
    "https://www.swansea.ac.uk/postgraduate/taught/maths-comp-sci/computer-science/msc-artificial-intelligence/",
    "https://www.swansea.ac.uk/postgraduate/taught/science/computer-science/msc-computer-science/",
    "https://www.swansea.ac.uk/postgraduate/taught/science/computer-science/msc-cyber-security/",
    "https://www.swansea.ac.uk/postgraduate/taught/science/computer-science/msc-data-science/",
    "https://www.royalholloway.ac.uk/studying-here/postgraduate/computer-science/computer-science/",
    "https://www.aston.ac.uk/study/courses/artificial-intelligence-msc/april-2025",
    "https://www.aston.ac.uk/study/courses/computer-science-msc/september-2025",
    "https://www.city.ac.uk/prospective-students/courses/postgraduate/artificial-intelligence",
    "https://technology.online.city.ac.uk/msc-computer-science?_gl=1*1joii5n*_gcl_au*NjI4ODM0MjQuMTczOTA2MTg0Ng..*_ga*MTgwNjc3MDk2MC4xNzM5MDYxODQ2*_ga_YLSK0292X4*MTczOTIzMDIxNy4yLjEuMTczOTIzMDI4MS41Ny4wLjA.",
"https://scholarshiproar.com/uk-scholarships-for-international-students/",
"https://www.studyin-uk.com/study-guide/top-10-uk-universities-for-msc-computer-science/",
"https://yocket.com/blog/masters-msc-in-computer-science-in-uk"
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN2)
const db = client.db(ASTRA_DB_API_ENDPOINT2 as string, { namespace: ASTRA_DB_NAMESPACE2 })

// Text cleaning utilities
const cleanText = (text: string): string => {
    return text
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\s+([.,!?;:])/g, '$1')
        .replace(/<[^>]*>(\s*)<\/[^>]*>/g, '')
        .trim();
};

// Remove boilerplate content
const removeBoilerplate = (text: string): string => {
    const boilerplatePatterns = [
        /Home\s*Back to home/gi,
        /Skip to main content/gi,
        /Cookie Policy/gi,
        /Privacy Notice/gi,
        /Terms and Conditions/gi,
    ];

    return boilerplatePatterns.reduce((text, pattern) =>
        text.replace(pattern, ''), text);
};

// Preprocess text before splitting
const preprocessText = (text: string): string => {
    return text
        .replace(/\b(\w+)\s+\1\b/gi, '$1')
        .replace(/\s+(e\.g\.|i\.e\.|etc\.)\s+/g, ' $1 ')
        .replace(/([.!?])\s*(\w)/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim();
};

// Create improved splitter
const createImprovedSplitter = () => {
    return new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
        separators: [". ", "! ", "? ", "\n\n", "\n", " ", ""]
    });
};

// Utility to extract school name from URL
const extractSchoolName = (url: string): string => {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        let schoolName = hostname
            .replace(/^www\.|\.ac\.uk$|\.edu$|\.com$/g, '')
            .split('.')
            .filter(part => part !== 'online' && part !== 'courses' && part !== 'study')
            .join(' ');

        schoolName = schoolName
            .split(/[-.]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        return schoolName;
    } catch (error) {
        console.error(`Error extracting school name from ${url}:`, error);
        return 'Unknown School';
    }
};

const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    try {
        const res = await db.createCollection(ASTRA_DB_COLLECTION2 as string, {
            vector: {
                dimension: 768,
                metric: similarityMetric
            }
        });
        console.log("Collection created:", res);
        return true;
    } catch (error) {
        console.error("Error creating collection:", error);
        return false;
    }
};

const checkCollectionExists = async (): Promise<boolean> => {
    try {
        const collections = await db.listCollections();
        const exists = collections.some(collection => collection.name === ASTRA_DB_COLLECTION2);
        console.log('Collection exists:', exists);
        return exists;
    } catch (error) {
        console.error("Error checking collection existence:", error);
        return false;
    }
};

// Modified page scraper to handle both content and title
const scrapePage = async (url: string): Promise<PageContent> => {
    if (!url || typeof url !== 'string') {
        throw new Error(`Invalid URL provided: ${url}`);
    }
    try {
        new URL(url);
    } catch (e) {
        throw new Error(`Malformed URL: ${url}`);
    }

    // Create a custom loader that can return both content and title
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        },
        gotoOptions: {
            waitUntil: "domcontentloaded",
            timeout: 60000
        },
        async evaluate(page, browser) {
            try {
                await page.waitForSelector('body', { timeout: 60000 });

                // We'll return a string that contains both content and title
                // Then parse it later
                const result = await page.evaluate(() => {
                    const selectorsToRemove = [
                        'header', 'footer', 'nav', '.navigation',
                        '.menu', '.cookie-notice', '.sidebar',
                    ];

                    selectorsToRemove.forEach(selector => {
                        document.querySelectorAll(selector).forEach(el => el.remove());
                    });

                    const mainContent = document.querySelector('main') || document.body;
                    const titleElement = document.querySelector('h1') ||
                        document.querySelector('main h1') ||
                        document.querySelector('.page-title') ||
                        document.querySelector('.course-title');
                    const title = document.title || " ";

                    // Combine title and content with a special delimiter we can parse later
                    return JSON.stringify({
                        content: mainContent.innerText,
                        title: titleElement ? title + ". " + titleElement.innerText.trim() : title
                    });
                });

                await browser.close();
                return result;
            } catch (error) {
                await browser.close();
                throw error;
            }
        }
    });

    try {
        const rawResult = await loader.scrape();
        // Parse the JSON string back to an object
        const result = JSON.parse(rawResult);

        return {
            content: cleanText(removeBoilerplate(result.content)),
            title: result.title || ''
        };
    } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
        throw error;
    }
};

// Modified process web content function
const processWebContent = async (url: string): Promise<ChunkData[]> => {
    try {
        // Get school name
        const schoolName = extractSchoolName(url);

        // Scrape content and title
        const { content: rawContent, title: pageTitle } = await scrapePage(url);

        // Preprocess the content
        const preprocessedContent = preprocessText(rawContent);

        // Create splitter
        const splitter = createImprovedSplitter();

        // Split into chunks
        const chunks = await splitter.splitText(preprocessedContent);

        // Process chunks with metadata
        const validChunks = chunks
            .map(chunk => cleanText(chunk))
            .filter(chunk => {
                if (chunk.length < 50) return false;
                if (/^(home|back|menu|navigation)$/i.test(chunk)) return false;

                const words = chunk.toLowerCase().split(' ');
                const uniqueWords = new Set(words);
                if (uniqueWords.size < words.length * 0.5) return false;

                return true;
            })
            .map(chunk => ({
                text: chunk,
                schoolName,
                pageTitle,
                url
            }));

        return validChunks;
    } catch (error) {
        console.error(`Error processing ${url}:`, error);
        throw error;
    }
};

const embedding = async (text: string) => {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    return embedding;
};

// Modified load sample data function
const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION2 as string);

    const validUrls = f1Data.filter(url => {
        if (!url) return false;
        try {
            new URL(url);
            return true;
        } catch {
            console.warn(`Skipping invalid URL: ${url}`);
            return false;
        }
    });

    for (const url of validUrls) {
        try {
            console.log(`Scraping ${url}...`);
            const chunks = await processWebContent(url);

            if (!chunks || chunks.length === 0) {
                console.warn(`No content retrieved from ${url}`);
                continue;
            }

            for (const chunk of chunks) {
                if (!chunk.text.trim()) continue;
                try {
                    const vector = await embedding(chunk.text);
                    if (!vector || !vector.values || vector.values.length === 0) {
                        console.warn(`Invalid embedding generated for chunk from ${url}`);
                        continue;
                    }
console.log( chunk.schoolName, chunk.pageTitle,chunk.url,vector.values, chunk.text,)
                    const res = await collection.insertOne({
                        $vector: vector.values,
                        text: chunk.text,
                        schoolName: chunk.schoolName,
                        pageTitle: chunk.pageTitle,
                        source_url: chunk.url,
                        timestamp: new Date().toISOString()
                    });

                    console.log(`Successfully inserted chunk from ${chunk.schoolName}`);
                } catch (error) {
                    console.error(`Error processing chunk from ${url}:`, error);
                    continue;
                }
            }

            // Update the list of processed URLs
            const index = f1Data.indexOf(url);
            if (index > -1) {
                f1Data.splice(index, 1);
            }
            fs.appendFileSync(path.join(__dirname, 'scraped_urls.txt'), `${url}\n`);
        } catch (error) {
            console.error(`Error processing URL ${url}:`, error);
            continue;
        }
    }
};

// Main initialization function
const init = async () => {
    try {
        // Check if collection exists before creating it
        const collectionExists = await checkCollectionExists();
        if (!collectionExists) {
            await createCollection();
        }
        await loadSampleData();
    } catch (error) {
        console.error("Error during initialization:", error);
    }
};

// Run the application
init();