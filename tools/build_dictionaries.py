#!/usr/bin/env python3
"""Builds data/dict-tr.json and data/dict-en.json for Find Me Puzzle.

Each file has one entry per word length ("5" to "8"):
  "a": words that can become the secret answer (common, clean words)
  "v": every word accepted as a guess (the full dictionary for that length)

Sources
  Turkish  mertemin/turkish-word-list (Vikisözlük word list), plus inflected forms
           taken from the wordfreq Turkish frequency list
  English  sindresorhus/word-list (MIT)
  Frequency data for choosing common words: wordfreq (pip)
  First and last names, to keep names out of the answers: names (pip)

Usage
  pip install -r tools/requirements.txt
  python3 tools/build_dictionaries.py            # writes to ../data
  python3 tools/build_dictionaries.py --out /tmp/x
"""
import argparse
import json
import os
import re
import urllib.request

import names
import wordfreq

TR_URL = "https://raw.githubusercontent.com/mertemin/turkish-word-list/master/words.txt"
EN_URL = "https://raw.githubusercontent.com/sindresorhus/word-list/main/words.txt"
LENGTHS = range(5, 9)

# Words that must never be an answer. They stay valid as guesses.
TR_BLOCK = set("orospu yarrak amcık kahpe pezevenk sikiş sikik siktir sikici gavat ibneler london".split())
EN_BLOCK = set(
    "whore bitch slut dildo nigger nigga faggot fagot cunts fucks fucker fucked shitty bastard "
    "pussy pussies retard retards rapist cocks twats whores sluts bitchy skank".split()
)
# Place and nationality words that the word list contains in lowercase.
EN_PLACES = set(
    "niger swiss china chinese japan french german dutch irish scots polish welsh turkey turkish greek "
    "roman african asian latino hindu muslim jewish arabic israel india texas ohio utah paris london "
    "berlin dublin tokyo syria libya kenya sudan egypt italy spain russia korea cuba haiti nepal tibet "
    "yemen qatar kuwait congo ghana".split()
)

TR_LETTERS = "çğıöşü"


def download(url):
    req = urllib.request.Request(url, headers={"User-Agent": "find-me-puzzle-build"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8")


def load_names():
    base = os.path.dirname(names.__file__)

    def first_tokens(fname):
        with open(os.path.join(base, fname), encoding="utf-8") as f:
            return [line.split()[0].lower() for line in f if line.strip()]

    first = set(first_tokens("dist.female.first")) | set(first_tokens("dist.male.first"))
    last = set(first_tokens("dist.all.last")[:8000])  # file is sorted by frequency
    return first, last


def build_turkish(en_dic):
    lemmas = set()
    for line in download(TR_URL).splitlines():
        w = line.strip()
        if not w:
            continue
        if not (w[0].islower() or w[0] in TR_LETTERS):
            continue  # proper nouns start with a capital letter
        if re.search(r"[^a-zçğıöşü]", w):
            continue  # phrases, hyphens, circumflex letters
        lemmas.add(w)

    freq = wordfreq.top_n_list("tr", 70000)
    rank = {w: i for i, w in enumerate(freq)}

    def is_answer(w):
        if rank.get(w, 10**9) >= 25000:
            return False
        if w.endswith(("mak", "mek")) or w in TR_BLOCK:
            return False
        if w in en_dic and not (set(w) & set(TR_LETTERS)):
            return False  # looks like a plain English word
        return True

    out = {}
    for n in LENGTHS:
        lem = [w for w in lemmas if len(w) == n]
        extras = [
            w for w in freq
            if len(w) == n and re.fullmatch(r"[a-zçğıöşü]+", w) and w not in lemmas
            and rank[w] < 45000 and w not in en_dic and not re.search(r"[qwx]", w)
        ]
        answers = sorted(w for w in lem if is_answer(w))
        valid = sorted(set(lem) | set(extras))
        out[str(n)] = {"a": " ".join(answers), "v": " ".join(valid)}
        print(f"tr {n}: {len(answers)} answers, {len(valid)} valid guesses")
    return out


def build_english(en_dic):
    first, last = load_names()
    freq = wordfreq.top_n_list("en", 60000)
    rank = {w: i for i, w in enumerate(freq)}

    def plural_like(w):
        if w.endswith("ies") and (w[:-3] + "y") in en_dic:
            return True
        if w.endswith("es") and w[:-2] in en_dic:
            return True
        return w.endswith("s") and not w.endswith("ss") and w[:-1] in en_dic

    out = {}
    for n in LENGTHS:
        words = sorted(w for w in en_dic if len(w) == n and re.fullmatch(r"[a-z]+", w))
        answers = [
            w for w in words
            if rank.get(w, 10**9) < 20000 and w not in EN_BLOCK and w not in EN_PLACES
            and w not in first and w not in last and not plural_like(w)
        ]
        out[str(n)] = {"a": " ".join(answers), "v": " ".join(words)}
        print(f"en {n}: {len(answers)} answers, {len(words)} valid guesses")
    return out


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(here, "..", "data"))
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    en_dic = {w.strip() for w in download(EN_URL).splitlines() if w.strip()}
    for lang, data in (("tr", build_turkish(en_dic)), ("en", build_english(en_dic))):
        # every answer must also be an accepted guess, and lengths must be right
        for n, entry in data.items():
            answers, valid = set(entry["a"].split()), set(entry["v"].split())
            assert answers <= valid, (lang, n)
            assert all(len(w) == int(n) for w in valid), (lang, n)
        path = os.path.join(args.out, f"dict-{lang}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        print("wrote", os.path.normpath(path))


if __name__ == "__main__":
    main()
