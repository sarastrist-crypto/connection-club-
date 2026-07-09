#!/usr/bin/env python3
"""Inject bootstrap_data.json into the template -> connectclub-bootstrap-launch.html"""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
data = json.load(open(os.path.join(here, "bootstrap_data.json")))
tpl = open(os.path.join(here, "bootstrap_report_template.html")).read()
out = tpl.replace("/*__DATA__*/null", json.dumps(data, separators=(",", ":")))
open(os.path.join(here, "connectclub-bootstrap-launch.html"), "w").write(out)
print("wrote connectclub-bootstrap-launch.html", len(out), "bytes")
