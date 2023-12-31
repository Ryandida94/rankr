import json
from typing import Dict, List

import requests
from bs4 import BeautifulSoup, Tag
from furl import furl

from config import qsc
from rankr import schemas as s
from rankr.crawlers.crawler_mixin import CrawlerMixin


class QSCrawler(CrawlerMixin):
    def __init__(self, url: str, **kwargs) -> None:
        self.url = url
        self.download_dir = qsc.DOWNLOAD_DIR
        super().__init__(**kwargs)

    def _get_page(self) -> str:
        """Retrieves the URL of raw json data for the ranking table.

        QS ranking tables (in https://www.topuniversities.com/) each
        have a unique "node number". For example, QS World University
        Rankings has the following short-link in the page's metadata:

        https://www.topuniversities.com/node/946820

        When loading the page, the browser will send a request to
        another address with this node numer:

        https://www.topuniversities.com/
        sites/default/files/qs-rankings-data/946820_indicators.txt

        Which is a json file, containing the ranking table data. So all
        we have to do is to find this node number and retrieve the json.

        Returns:
            str: The url for the ranking table data
        """
        html_page = requests.get(self.url, headers=qsc.HEADERS)
        html_soup = BeautifulSoup(html_page.content, "html.parser")
        node_tag = html_soup.find("article", {"data-history-node-id": True})
        assert isinstance(node_tag, Tag)

        self.json_url = (
            furl(qsc.BASE_URL)
            / "sites/default/files/qs-rankings-data/en"
            / f"{node_tag['data-history-node-id']}_indicators.txt"
        ).url
        return self.json_url

    def _get_tbl(self) -> List[Dict[str, str]]:
        """Processes raw ranking data into a list of dictionaries.

        Returns:
            List[Dict[str, str]]: Processed ranking data to be exported
        """
        page = requests.get(self.json_url, headers=qsc.HEADERS)
        raw_data = json.loads(page.text)

        # Column names are separated from actual data.
        columns = {}
        for col in raw_data["columns"]:
            col_disp = BeautifulSoup(col["title"], "html.parser").text
            col_name = qsc.FIELDS.get(col_disp.lower(), None)
            if not col_name:  # ignoring irrelevant data
                if "university" in col_disp.lower():
                    col_name = qsc.FIELDS.get("university")
                    columns[col["data"]] = col_name
                continue
            columns[col["data"]] = col_name

        # processing raw_data
        processed_data: List[Dict[str, str]] = []
        for row in raw_data["data"]:
            values = {}
            for col in row:
                if col not in columns:
                    continue

                # None values make BeautifulSoup raise exception.
                row[col] = "" if not row[col] else row[col]
                value = BeautifulSoup(row[col], "html.parser")
                if columns[col] == "country":
                    try:
                        country = s.CountryCreate(country=value.text)
                        values[columns[col]] = country.country
                        continue
                    except KeyError:
                        pass
                if columns[col] == "institution":
                    a_tag = value.find("a")
                    assert isinstance(a_tag, Tag)
                    url = None
                    if a_tag:
                        url = furl(qsc.BASE_URL).join(a_tag["href"]).url
                    values["url"] = url
                    values[columns[col]] = value.text.strip()
                    continue

                values[columns[col]] = value.text.strip()

            processed_data.append({**values, **self.ranking_info})

        self.processed_data = processed_data
        return self.processed_data
