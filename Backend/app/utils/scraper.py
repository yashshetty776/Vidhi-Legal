import re
import threading
import time
from urllib.parse import urljoin

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.chrome.options import Options

URL = "https://www.barandbench.com/collection/top-stories"
PAGE_LOAD_TIMEOUT_SECONDS = 15
SCRIPT_TIMEOUT_SECONDS = 10
CACHE_TTL_SECONDS = 300
MAX_ARTICLES = 12

_cache_lock = threading.Lock()
_cached_news: list[dict[str, str | None]] = []
_cached_at = 0.0
_scrape_lock = threading.Lock()


def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _create_driver() -> webdriver.Chrome:
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1440,1200")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument(
        "--user-agent=Vidhi/1.0 (+legal-news-reader; compatible; Chrome)"
    )

    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT_SECONDS)
    driver.set_script_timeout(SCRIPT_TIMEOUT_SECONDS)
    return driver


def _extract_news(html: str) -> list[dict[str, str | None]]:
    soup = BeautifulSoup(html, "html.parser")
    articles: list[dict[str, str | None]] = []
    seen_links: set[str] = set()

    for card in soup.select("div[class*='story-card-wrapper']"):
        headline_tag = card.find(["h1", "h2", "h3", "h4", "h5", "h6"])
        link_tag = card.find("a", href=True)
        if not headline_tag or not link_tag:
            continue

        headline = clean_text(headline_tag.get_text(" ", strip=True))
        article_link = urljoin(URL, link_tag["href"])
        image_tag = card.find("img")
        image_link = None
        if image_tag:
            image_link = (
                image_tag.get("src")
                or image_tag.get("data-src")
                or image_tag.get("data-lazy-src")
            )
            if image_link:
                image_link = urljoin(URL, image_link)

        if not headline or article_link in seen_links:
            continue

        seen_links.add(article_link)
        articles.append(
            {
                "headline": headline,
                "article_link": article_link,
                "image_link": image_link,
            }
        )
        if len(articles) == MAX_ARTICLES:
            break

    return articles


def scrape_news() -> list[dict[str, str | None]]:
    global _cached_news, _cached_at
    now = time.monotonic()
    with _cache_lock:
        if now - _cached_at < CACHE_TTL_SECONDS:
            return list(_cached_news)

    with _scrape_lock:
        with _cache_lock:
            if time.monotonic() - _cached_at < CACHE_TTL_SECONDS:
                return list(_cached_news)

        try:
            driver = _create_driver()
            try:
                driver.get(URL)
            except TimeoutException:
                driver.execute_script("window.stop();")
            news = _extract_news(driver.page_source)
        except WebDriverException as error:
            with _cache_lock:
                if _cached_news:
                    return list(_cached_news)
            raise RuntimeError("The legal news source could not be loaded") from error
        finally:
            if "driver" in locals():
                driver.quit()

        with _cache_lock:
            _cached_news = news
            _cached_at = time.monotonic()
        return list(news)


def has_fresh_cache() -> bool:
    with _cache_lock:
        return bool(_cached_news) and time.monotonic() - _cached_at < CACHE_TTL_SECONDS
