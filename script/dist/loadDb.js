"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var astra_db_ts_1 = require("@datastax/astra-db-ts");
var puppeteer_1 = require("langchain/document_loaders/web/puppeteer");
var text_splitter_1 = require("langchain/text_splitter");
require("dotenv/config");
var generative_ai_1 = require("@google/generative-ai");
var fs_1 = require("fs");
var path_1 = require("path");
// Environment variables
var _a = process.env, ASTRA_DB_NAMESPACE2 = _a.ASTRA_DB_NAMESPACE2, ASTRA_DB_COLLECTION2 = _a.ASTRA_DB_COLLECTION2, ASTRA_DB_API_ENDPOINT2 = _a.ASTRA_DB_API_ENDPOINT2, ASTRA_DB_APPLICATION_TOKEN2 = _a.ASTRA_DB_APPLICATION_TOKEN2, OPENAI_API_KEY = _a.OPENAI_API_KEY, MISTRAL_API_KEY = _a.MISTRAL_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY1 = _a.GOOGLE_GENERATIVE_AI_API_KEY1;
var genAI = new generative_ai_1.GoogleGenerativeAI(GOOGLE_GENERATIVE_AI_API_KEY1);
var f1Data = [
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
var client = new astra_db_ts_1.DataAPIClient(ASTRA_DB_APPLICATION_TOKEN2);
var db = client.db(ASTRA_DB_API_ENDPOINT2, { namespace: ASTRA_DB_NAMESPACE2 });
// Text cleaning utilities
var cleanText = function (text) {
    return text
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\s+([.,!?;:])/g, '$1')
        .replace(/<[^>]*>(\s*)<\/[^>]*>/g, '')
        .trim();
};
// Remove boilerplate content
var removeBoilerplate = function (text) {
    var boilerplatePatterns = [
        /Home\s*Back to home/gi,
        /Skip to main content/gi,
        /Cookie Policy/gi,
        /Privacy Notice/gi,
        /Terms and Conditions/gi,
    ];
    return boilerplatePatterns.reduce(function (text, pattern) {
        return text.replace(pattern, '');
    }, text);
};
// Preprocess text before splitting
var preprocessText = function (text) {
    return text
        .replace(/\b(\w+)\s+\1\b/gi, '$1')
        .replace(/\s+(e\.g\.|i\.e\.|etc\.)\s+/g, ' $1 ')
        .replace(/([.!?])\s*(\w)/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim();
};
// Create improved splitter
var createImprovedSplitter = function () {
    return new text_splitter_1.RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
        separators: [". ", "! ", "? ", "\n\n", "\n", " ", ""]
    });
};
// Utility to extract school name from URL
var extractSchoolName = function (url) {
    try {
        var urlObj = new URL(url);
        var hostname = urlObj.hostname;
        var schoolName = hostname
            .replace(/^www\.|\.ac\.uk$|\.edu$|\.com$/g, '')
            .split('.')
            .filter(function (part) { return part !== 'online' && part !== 'courses' && part !== 'study'; })
            .join(' ');
        schoolName = schoolName
            .split(/[-.]/)
            .map(function (word) { return word.charAt(0).toUpperCase() + word.slice(1); })
            .join(' ');
        return schoolName;
    }
    catch (error) {
        console.error("Error extracting school name from " + url + ":", error);
        return 'Unknown School';
    }
};
var createCollection = function (similarityMetric) {
    if (similarityMetric === void 0) { similarityMetric = "dot_product"; }
    return __awaiter(void 0, void 0, void 0, function () {
        var res, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.createCollection(ASTRA_DB_COLLECTION2, {
                            vector: {
                                dimension: 768,
                                metric: similarityMetric
                            }
                        })];
                case 1:
                    res = _a.sent();
                    console.log("Collection created:", res);
                    return [2 /*return*/, true];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error creating collection:", error_1);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
};
var checkCollectionExists = function () { return __awaiter(void 0, void 0, Promise, function () {
    var collections, exists, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db.listCollections()];
            case 1:
                collections = _a.sent();
                exists = collections.some(function (collection) { return collection.name === ASTRA_DB_COLLECTION2; });
                console.log('Collection exists:', exists);
                return [2 /*return*/, exists];
            case 2:
                error_2 = _a.sent();
                console.error("Error checking collection existence:", error_2);
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Modified page scraper to handle both content and title
var scrapePage = function (url) { return __awaiter(void 0, void 0, Promise, function () {
    var loader, rawResult, result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!url || typeof url !== 'string') {
                    throw new Error("Invalid URL provided: " + url);
                }
                try {
                    new URL(url);
                }
                catch (e) {
                    throw new Error("Malformed URL: " + url);
                }
                loader = new puppeteer_1.PuppeteerWebBaseLoader(url, {
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
                    evaluate: function (page, browser) {
                        return __awaiter(this, void 0, void 0, function () {
                            var result, error_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 4, , 6]);
                                        return [4 /*yield*/, page.waitForSelector('body', { timeout: 60000 })];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, page.evaluate(function () {
                                                var selectorsToRemove = [
                                                    'header', 'footer', 'nav', '.navigation',
                                                    '.menu', '.cookie-notice', '.sidebar',
                                                ];
                                                selectorsToRemove.forEach(function (selector) {
                                                    document.querySelectorAll(selector).forEach(function (el) { return el.remove(); });
                                                });
                                                var mainContent = document.querySelector('main') || document.body;
                                                var titleElement = document.querySelector('h1') ||
                                                    document.querySelector('main h1') ||
                                                    document.querySelector('.page-title') ||
                                                    document.querySelector('.course-title');
                                                var title = document.title || " ";
                                                // Combine title and content with a special delimiter we can parse later
                                                return JSON.stringify({
                                                    content: mainContent.innerText,
                                                    title: titleElement ? title + ". " + titleElement.innerText.trim() : title
                                                });
                                            })];
                                    case 2:
                                        result = _a.sent();
                                        return [4 /*yield*/, browser.close()];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/, result];
                                    case 4:
                                        error_4 = _a.sent();
                                        return [4 /*yield*/, browser.close()];
                                    case 5:
                                        _a.sent();
                                        throw error_4;
                                    case 6: return [2 /*return*/];
                                }
                            });
                        });
                    }
                });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, loader.scrape()];
            case 2:
                rawResult = _a.sent();
                result = JSON.parse(rawResult);
                return [2 /*return*/, {
                        content: cleanText(removeBoilerplate(result.content)),
                        title: result.title || ''
                    }];
            case 3:
                error_3 = _a.sent();
                console.error("Failed to scrape " + url + ":", error_3);
                throw error_3;
            case 4: return [2 /*return*/];
        }
    });
}); };
// Modified process web content function
var processWebContent = function (url) { return __awaiter(void 0, void 0, Promise, function () {
    var schoolName_1, _a, rawContent, pageTitle_1, preprocessedContent, splitter, chunks, validChunks, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                schoolName_1 = extractSchoolName(url);
                return [4 /*yield*/, scrapePage(url)];
            case 1:
                _a = _b.sent(), rawContent = _a.content, pageTitle_1 = _a.title;
                preprocessedContent = preprocessText(rawContent);
                splitter = createImprovedSplitter();
                return [4 /*yield*/, splitter.splitText(preprocessedContent)];
            case 2:
                chunks = _b.sent();
                validChunks = chunks
                    .map(function (chunk) { return cleanText(chunk); })
                    .filter(function (chunk) {
                    if (chunk.length < 50)
                        return false;
                    if (/^(home|back|menu|navigation)$/i.test(chunk))
                        return false;
                    var words = chunk.toLowerCase().split(' ');
                    var uniqueWords = new Set(words);
                    if (uniqueWords.size < words.length * 0.5)
                        return false;
                    return true;
                })
                    .map(function (chunk) { return ({
                    text: chunk,
                    schoolName: schoolName_1,
                    pageTitle: pageTitle_1,
                    url: url
                }); });
                return [2 /*return*/, validChunks];
            case 3:
                error_5 = _b.sent();
                console.error("Error processing " + url + ":", error_5);
                throw error_5;
            case 4: return [2 /*return*/];
        }
    });
}); };
var embedding = function (text) { return __awaiter(void 0, void 0, void 0, function () {
    var model, result, embedding;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                model = genAI.getGenerativeModel({ model: "embedding-001" });
                return [4 /*yield*/, model.embedContent(text)];
            case 1:
                result = _a.sent();
                embedding = result.embedding;
                return [2 /*return*/, embedding];
        }
    });
}); };
// Modified load sample data function
var loadSampleData = function () { return __awaiter(void 0, void 0, void 0, function () {
    var collection, validUrls, _i, validUrls_1, url, chunks, _a, chunks_1, chunk, vector, res, error_6, index, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, db.collection(ASTRA_DB_COLLECTION2)];
            case 1:
                collection = _b.sent();
                validUrls = f1Data.filter(function (url) {
                    if (!url)
                        return false;
                    try {
                        new URL(url);
                        return true;
                    }
                    catch (_a) {
                        console.warn("Skipping invalid URL: " + url);
                        return false;
                    }
                });
                _i = 0, validUrls_1 = validUrls;
                _b.label = 2;
            case 2:
                if (!(_i < validUrls_1.length)) return [3 /*break*/, 14];
                url = validUrls_1[_i];
                _b.label = 3;
            case 3:
                _b.trys.push([3, 12, , 13]);
                console.log("Scraping " + url + "...");
                return [4 /*yield*/, processWebContent(url)];
            case 4:
                chunks = _b.sent();
                if (!chunks || chunks.length === 0) {
                    console.warn("No content retrieved from " + url);
                    return [3 /*break*/, 13];
                }
                _a = 0, chunks_1 = chunks;
                _b.label = 5;
            case 5:
                if (!(_a < chunks_1.length)) return [3 /*break*/, 11];
                chunk = chunks_1[_a];
                if (!chunk.text.trim())
                    return [3 /*break*/, 10];
                _b.label = 6;
            case 6:
                _b.trys.push([6, 9, , 10]);
                return [4 /*yield*/, embedding(chunk.text)];
            case 7:
                vector = _b.sent();
                if (!vector || !vector.values || vector.values.length === 0) {
                    console.warn("Invalid embedding generated for chunk from " + url);
                    return [3 /*break*/, 10];
                }
                console.log(chunk.schoolName, chunk.pageTitle, chunk.url, vector.values, chunk.text);
                return [4 /*yield*/, collection.insertOne({
                        $vector: vector.values,
                        text: chunk.text,
                        schoolName: chunk.schoolName,
                        pageTitle: chunk.pageTitle,
                        source_url: chunk.url,
                        timestamp: new Date().toISOString()
                    })];
            case 8:
                res = _b.sent();
                console.log("Successfully inserted chunk from " + chunk.schoolName);
                return [3 /*break*/, 10];
            case 9:
                error_6 = _b.sent();
                console.error("Error processing chunk from " + url + ":", error_6);
                return [3 /*break*/, 10];
            case 10:
                _a++;
                return [3 /*break*/, 5];
            case 11:
                index = f1Data.indexOf(url);
                if (index > -1) {
                    f1Data.splice(index, 1);
                }
                fs_1["default"].appendFileSync(path_1["default"].join(__dirname, 'scraped_urls.txt'), url + "\n");
                return [3 /*break*/, 13];
            case 12:
                error_7 = _b.sent();
                console.error("Error processing URL " + url + ":", error_7);
                return [3 /*break*/, 13];
            case 13:
                _i++;
                return [3 /*break*/, 2];
            case 14: return [2 /*return*/];
        }
    });
}); };
// Main initialization function
var init = function () { return __awaiter(void 0, void 0, void 0, function () {
    var collectionExists, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, checkCollectionExists()];
            case 1:
                collectionExists = _a.sent();
                if (!!collectionExists) return [3 /*break*/, 3];
                return [4 /*yield*/, createCollection()];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [4 /*yield*/, loadSampleData()];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                error_8 = _a.sent();
                console.error("Error during initialization:", error_8);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
// Run the application
init();
