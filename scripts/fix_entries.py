"""
修复 entries.json 中的准确性问题
"""
import json

PATH = 'D:/claude-code/pension-tracker/data/entries.json'
with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

entries = data['entries']
fixes = []

# === 1. 查看当前所有条目 ===
print("=== 当前条目 ===")
for e in entries:
    print(f"ID {e['id']:2d} | {e['country']} | {e['date']} | {e['title'][:50]}")

print("\n=== 修复列表 ===")

# === 2. 中国：22连涨条目 ===
for e in entries:
    if e['id'] == 5 and '22连涨' in e['title']:
        print(f"【修复】中国22连涨条目(ID {e['id']})")
        e['source'] = '网易号/搜狐 (自媒体分析，非官方公告)'
        e['content'] += '（注：以上分析综合自媒体观点和机构预测，非人社部官方公告。官方调整方案通常于每年全国两会后公布。）'
        fixes.append('China 22连涨: added source caveat')
        break

# === 3. 韩国：加密资产条目 ===
for e in entries:
    if e['id'] == 4 and '加密' in e['title']:
        print(f"【修复】韩国加密资产条目(ID {e['id']})")
        e['source'] = '韩联社/每日经济新闻'
        # Update content to be more precise
        e['content'] = e['content'].replace(
            '韩国政府2026年4月宣布将虚拟资产纳入基础养老金资格审查范围',
            '韩国保健福祉部2026年4月推动修订《基础养老金法》，将虚拟资产（加密货币）纳入基础养老金资格审查范围'
        )
        fixes.append('Korea crypto: improved source and content accuracy')
        break

# === 4. 验证所有ID连续性 ===
ids = sorted([e['id'] for e in entries])
expected = list(range(1, len(entries) + 1))
if ids != expected:
    print(f"[!] ID不连续: 现有 {ids}, 期望 {expected}")
    # Re-number
    for i, e in enumerate(sorted(entries, key=lambda x: x['id'])):
        e['id'] = i + 1
    print("[OK] ID已重新编号")
else:
    print("[OK] ID连续无误")

# === 5. 更新元数据 ===
data['metadata']['total_entries'] = len(entries)
data['metadata']['last_updated'] = '2026-05-06'

# 保存
with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n[OK] 保存完成! 共 {len(entries)} 条条目")
print(f"修复项: {len(fixes)} 处")

# 最终验证
print("\n=== 最终条目清单 ===")
for e in entries:
    print(f"  ID {e['id']:2d} | {e['country']} | {e['date']} | {e['title'][:55]}")
