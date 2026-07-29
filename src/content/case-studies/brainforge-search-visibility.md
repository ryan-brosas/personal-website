---
title: "Built to Be Found"
description: "A consultancy blog was built for search and set up so AI answer engines may cite it without training on it."
visibility: public
owner: ryan
kind: case-study
slug: brainforge-search-visibility
pillar: content-research-operations
evidence:
  kind: verified
  sourceId: source-brainforge-ai-access-001
diagram:
  kind: reach-gap
  caption: "Every cell is one impression. The filled cell is the click."
  total:
    label: "Impressions"
    value: 915000
    detail: "People who saw a result in the 28 days ending 10 March 2026."
  captured:
    label: "Clicks"
    value: 1690
    detail: "People who came through to the blog in the same window."
  note: "Being seen is solved. Being chosen is the work that is left."
cta:
  eyebrow: "Search visibility from zero"
  title: "Get found before the sales call."
  body: "Buyers look for your expertise long before they ask for a meeting. Bring me the topics your team already answers on calls."
  primaryLabel: "Talk about your content"
---

I worked at Brainforge from September 2024 to March 2026. Brainforge is an AI and
data consultancy. I wrote the blog and ghostwrote leadership posts, then later
worked on go to market automation. This was a full time role, not an outside
engagement.

Two parts of that work can be checked. The blog is public, and so are the files
that tell AI answer engines how to treat it. The search numbers are private, so
they are reported here as figures I read, not as something you can open.

## The problem

In September 2024 the blog had no search presence. Not thin traffic. Zero.

A consultancy sells what it knows. Buyers look for that knowledge months before
they ask for a call. When nothing comes back, the firm only exists to people who
already know its name. Every deal has to start from an introduction.

Then a second problem arrived on top of the first. Buyers stopped typing only
into search boxes. They started asking assistants. A page can rank well and still
never be read out by the tool doing the asking.

## What I did

I wrote the blog and ghostwrote leadership posts for the founder.

The work ran continuously for more than a year. It was not a campaign with a
start and an end. Pages published early kept gathering impressions long after
they went up, which is why the numbers below cover a month well after the writing
role ended.

## Making the site readable to AI without feeding training

Most sites answer this question by accident. They either block every AI crawler
or block none. Both are blunt, because two different things are being decided.

The first question is whether an assistant may read the page to answer someone
right now. The second is whether a company may keep the page to train a model.
Those deserve different answers. Being quoted with a link is free marketing.
Being absorbed into a model is not.

So the site says both things out loud.

- **A signal for every reader.** The robots file declares that search is allowed,
  training is not, and the content may be used as a reference.
- **Named rules for named crawlers.** Training crawlers are turned away one by
  one. That covers GPTBot, ClaudeBot, Google-Extended, CCBot, Bytespider,
  Applebot-Extended, Amazonbot, and Meta's crawler.
- **Search crawlers stay welcome.** The bots that fetch a page to answer a live
  question are left alone, so the site can still be quoted and linked.
- **A short file written for machines.** An llms.txt at the root gives an
  assistant a plain summary, the core pages, and a set of agent readable
  references, instead of making it guess from the navigation.
- **Marked up pages.** Posts carry article, breadcrumb, and author data, so a
  machine reading the page can tell what it is and who wrote it.

You can check all of it yourself. The robots file and the llms.txt are public.

## The result

Search visibility went from nothing to real volume.

In the 28 days ending 10 March 2026, Search Console recorded about 915,000
impressions and about 1,690 clicks. Average position was 8.1. Counting from a
standing start in September 2024, that is roughly 18 months of steady work.

The click rate is the honest weak point. About 1,690 clicks against about 915,000
impressions is a rate near 0.2 percent. At an average position of 8.1, that gap
says most of those impressions come from searches the pages rank for but readers
do not want. Volume came first. Clicks are the next problem, not a solved one.

## What remains limited

The access work is set up, not proven. On 30 July 2026 I asked an AI search tool
three topic questions that did not name the company, including one the blog
targets directly. It cited other sources every time. The site is built to be
quoted. It is not yet winning those answers.

Impressions are not readers. Readers are not leads. This case covers the first
step of that chain and nothing past it. It does not show pipeline, deals, or
revenue.

The search figures are one 28-day window, read months after the writing role
ended. They are a snapshot of a moving number, not a final score. They also come
from a private dashboard, so a reader has to take them on my word. The AI access
work is the part anyone can verify.

So the claim here is narrow. A blog with no search presence reached real search
volume, the site now states clearly how machines may use it, and turning that
volume into clicks and citations is still open work.
