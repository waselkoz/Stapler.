import json
from backend.stapler_graph import stapler_graph

print("Invoking graph...")
res = stapler_graph.invoke({"input_idea": "An AI app for developers to write boilerplate code in react", "iterations": 0})

with open("test_output.txt", "w", encoding="utf-8") as f:
    f.write("==== ERROR ====\n")
    f.write(str(res.get("error")) + "\n")
    f.write("===============\n")
    f.write("==== AUDIT ====\n")
    if res.get("audit"):
        f.write(json.dumps(res["audit"].model_dump(), indent=2) + "\n")
    f.write("===============\n")
