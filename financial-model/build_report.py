#!/usr/bin/env python3
"""Inject report_data.json into the HTML template -> connectclub-runway-analysis.html"""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
data = json.load(open(os.path.join(here, "report_data.json")))
tpl = open(os.path.join(here, "report_template.html")).read()
out = tpl.replace("/*__DATA__*/null", json.dumps(data, separators=(",", ":")))
open(os.path.join(here, "connectclub-runway-analysis.html"), "w").write(out)
print("wrote connectclub-runway-analysis.html", len(out), "bytes")
