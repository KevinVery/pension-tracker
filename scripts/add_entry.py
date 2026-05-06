"""
全球养老金政策动态追踪 — 添加新条目脚本
用法: python scripts/add_entry.py
"""

import json
import os
import sys
from datetime import datetime, date

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'entries.json')

COUNTRIES = ['美国','英国','加拿大','澳大利亚','日本','德国','法国','意大利',
             '中国','韩国','巴西','印度','阿根廷','俄罗斯','荷兰','墨西哥']

CATEGORIES = ['政策改革','政策调整','法规更新','投资动态','数据发布','行政安排']

def load_data():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ 已保存到 {DATA_FILE}")

def get_next_id(entries):
    return max(e['id'] for e in entries) + 1 if entries else 1

def print_summary(entry):
    print(f"\n{'='*50}")
    print(f"📌 #{entry['id']} | {entry['country']} | {'⭐' * entry['importance']}")
    print(f"   {entry['title']}")
    print(f"   📅 {entry['date']}  |  📂 {entry['category']}")
    print(f"   🔗 {entry['url']}")
    print(f"   📚 {entry['source']}")
    print(f"{'='*50}\n")

def interactive_add():
    data = load_data()
    entries = data['entries']
    meta = data['metadata']

    entry = {}
    entry['id'] = get_next_id(entries)

    # 国家
    print("\n可选国家:")
    for i, c in enumerate(COUNTRIES, 1):
        print(f"  {i}. {c}")
    while True:
        choice = input("选择国家编号 (1-16): ").strip()
        if choice.isdigit() and 1 <= int(choice) <= 16:
            entry['country'] = COUNTRIES[int(choice)-1]
            break
        print("❌ 无效选择")

    # 标题
    entry['title'] = input("标题: ").strip()
    while not entry['title']:
        entry['title'] = input("标题不能为空: ").strip()

    # 内容
    entry['content'] = input("内容摘要: ").strip()
    while not entry['content']:
        entry['content'] = input("内容不能为空: ").strip()

    # 日期
    today = date.today().isoformat()
    entry['date'] = input(f"日期 (YYYY-MM-DD, 默认 {today}): ").strip() or today

    # 分类
    print("\n分类:")
    for i, c in enumerate(CATEGORIES, 1):
        print(f"  {i}. {c}")
    while True:
        choice = input("选择分类编号 (1-6): ").strip()
        if choice.isdigit() and 1 <= int(choice) <= 6:
            entry['category'] = CATEGORIES[int(choice)-1]
            break
        print("❌ 无效选择")

    # 重要性
    while True:
        choice = input("重要性 (1-5, 5=最高): ").strip()
        if choice.isdigit() and 1 <= int(choice) <= 5:
            entry['importance'] = int(choice)
            break
        print("❌ 请输入1-5")

    # 来源
    entry['source'] = input("来源机构: ").strip()
    while not entry['source']:
        entry['source'] = input("来源不能为空: ").strip()

    # URL
    entry['url'] = input("原文URL: ").strip()

    # 确认
    print_summary(entry)
    confirm = input("确认添加？(Y/n): ").strip().lower()
    if confirm == 'n':
        print("已取消")
        return

    # 添加到数据
    entries.append(entry)
    meta['last_updated'] = today
    meta['total_entries'] = len(entries)
    if entry['date'] > meta.get('report_period_end', ''):
        meta['report_period_end'] = entry['date']

    save_data(data)
    print(f"\n🎉 已添加 #{entry['id']}，共 {len(entries)} 条动态")

def batch_add():
    """快速批量添加：用预先准备好的文本格式"""
    print("批量添加模式（开发中，先用交互模式）")
    interactive_add()

if __name__ == '__main__':
    print("=" * 50)
    print("  全球养老金政策动态追踪 — 添加条目")
    print("=" * 50)
    interactive_add()
