import { describe, expect, it } from "vitest";
import type { Post } from "@ts-ghost/content-api";

import { frontMatterGenerator } from "./markdown-converter";

describe("frontMatterGenerator", () => {
  const post: Post = {
    slug: "odoo-15-javascript-reference",
    id: "6166e323f7a43a65054cd234",
    title: "Odoo 15 JavaScript Reference: OWL Views, WebClient, Services, and hooks.",
    html: '<p>Odoo 15 is out, and with that comes a big rewrite of the WebClient, a new Odoo JavaScript module ES6-like system, registries, hooks, new Model, and the possibility to write new Views as OWL Component. </p><p>This article will go over some of the biggest additions, give a quick overview or full analysis, and some basic usage examples.</p><h2 id="odoo-module-es6-like-syntax">Odoo module ES6-like syntax</h2><p>Odoo 15 introduced a new way of defining our JavaScript module instead of the usual ',
    comment_id: "6166e323f7a43a65054cd234",
    plaintext: "Odoo 15 is out, and with that comes a big rewrite of the WebClient, a new Odoo\n",
    feature_image:
      "https://codingdodo.com/content/images/2021/10/post-cover-odoo-15-javascript-reference-5.png",
    featured: true,
    visibility: "public",
    created_at: "2021-10-13T13:46:11.000+00:00",
    updated_at: "2021-10-18T03:00:00.000+00:00",
    published_at: "2021-10-18T03:00:00.000+00:00",
    custom_excerpt: null,
    codeinjection_head: null,
    codeinjection_foot: null,
    custom_template: "custom-with-table-of-contents-and-sidebar",
    canonical_url: "https://codingdodo.com/odoo-15-javascript-reference",
    authors: [
      {
        id: "68f8bdb4c2a74e000108c75d",
        name: "Philippe L'ATTENTION",
        slug: "coding-dodo",
        profile_image: "https://codingdodo.com/content/images/2021/04/small-logo-1.png",
        cover_image: "https://codingdodo.com/content/images/2021/04/Coding-Dodo-1.png",
        bio: "Creator of CodingDodo, I am a Software Architect that loves Python, JavaScript, TypeScript, and Software Architecture in general. I like to share the things I learn through teaching them!",
        website: "https://bio.link/codingdodo",
        location: "Reunion Island",
        facebook: "CodingDodo/",
        twitter: "@_philDL",
        meta_title: null,
        meta_description: null,
        url: "https://codingdodo.com/author/coding-dodo/",
      },
    ],
    tags: [
      {
        id: "615a90c383e6c554c7b05aca",
        name: "Odoo 15",
        slug: "odoo-15",
        description: "Odoo 15 Tutorials and guide about OWL, JavaScript, and python.",
        feature_image: null,
        visibility: "public",
        og_image: null,
        og_title: null,
        og_description: null,
        twitter_image: null,
        twitter_title: null,
        twitter_description: null,
        meta_title: null,
        meta_description: null,
        codeinjection_head: null,
        codeinjection_foot: null,
        canonical_url: null,
        accent_color: null,
        url: "https://codingdodo.com/tag/odoo-15/",
      },
      {
        id: "60abac650f13dc3da65ccb88",
        name: "OWL",
        slug: "owl",
        description:
          "OWL, Odoo Web Library tutorials and tips. Real-world examples about the new Odoo front-end JavaScript Framework. OWL Inside Odoo and OWL as a standalone JavaScript Project.",
        feature_image: "https://codingdodo.com/content/images/2021/05/tag-owl.png",
        visibility: "public",
        og_image: null,
        og_title: null,
        og_description: null,
        twitter_image: null,
        twitter_title: null,
        twitter_description:
          "Odoo OWL tutorials, guides, analysis and walkthrough. Real-world examples about the new Odoo front-end JavaScript Framework.",
        meta_title: "Odoo OWL Tutorials - Coding Dodo",
        meta_description:
          "Odoo OWL tutorials, guides, analysis and walkthrough. Real-world examples about the new Odoo front-end JavaScript Framework.",
        codeinjection_head: null,
        codeinjection_foot: null,
        canonical_url: "https://codingdodo.com/tag/owl/",
        accent_color: "#da814e",
        url: "https://codingdodo.com/tag/owl/",
      },
      {
        id: "6079843e924f6219c823474c",
        name: "JavaScript",
        slug: "javascript",
        description:
          "JavaScript-focused Tutorials. Be it general Vanilla JavaScript knowledge, VueJS, React, JQuery, Odoo Specific JavaScript Framework or, OWL.",
        feature_image: "https://codingdodo.com/content/images/2021/04/tag-js.png",
        visibility: "public",
        og_image: null,
        og_title: null,
        og_description: null,
        twitter_image: null,
        twitter_title: null,
        twitter_description: null,
        meta_title: null,
        meta_description: null,
        codeinjection_head: null,
        codeinjection_foot: null,
        canonical_url: null,
        accent_color: "#f7de76",
        url: "https://codingdodo.com/tag/javascript/",
      },
      {
        id: "6133815087673c51c878682a",
        name: "#syntax-highlight",
        slug: "hash-syntax-highlight",
        description: null,
        feature_image: null,
        visibility: "internal",
        og_image: null,
        og_title: null,
        og_description: null,
        twitter_image: null,
        twitter_title: null,
        twitter_description: null,
        meta_title: null,
        meta_description: null,
        codeinjection_head: null,
        codeinjection_foot: null,
        canonical_url: null,
        accent_color: null,
        url: "https://codingdodo.com/404/",
      },
    ],
    primary_author: {
      id: "68f8bdb4c2a74e000108c75d",
      name: "Philippe L'ATTENTION",
      slug: "coding-dodo",
      profile_image: "https://codingdodo.com/content/images/2021/04/small-logo-1.png",
      cover_image: "https://codingdodo.com/content/images/2021/04/Coding-Dodo-1.png",
      bio: "Creator of CodingDodo, I am a Software Architect that loves Python, JavaScript, TypeScript, and Software Architecture in general. I like to share the things I learn through teaching them!",
      website: "https://bio.link/codingdodo",
      location: "Reunion Island",
      facebook: "CodingDodo/",
      twitter: "@_philDL",
      meta_title: null,
      meta_description: null,
      url: "https://codingdodo.com/author/coding-dodo/",
    },
    primary_tag: {
      id: "615a90c383e6c554c7b05aca",
      name: "Odoo 15",
      slug: "odoo-15",
      description: "Odoo 15 Tutorials and guide about OWL, JavaScript, and python.",
      feature_image: null,
      visibility: "public",
      og_image: null,
      og_title: null,
      og_description: null,
      twitter_image: null,
      twitter_title: null,
      twitter_description: null,
      meta_title: null,
      meta_description: null,
      codeinjection_head: null,
      codeinjection_foot: null,
      canonical_url: null,
      accent_color: null,
      url: "https://codingdodo.com/tag/odoo-15/",
    },
    url: "https://codingdodo.com/odoo-15-javascript-reference/",
    excerpt:
      "Odoo 15 is out, and with that comes a big rewrite of the WebClient, a new Odoo\n" +
      "JavaScript module ES6-like system, registries, hooks, new Model, and the\n" +
      "possibility to write new Views as OWL Component. \n" +
      "\n" +
      "This article will go over some of the biggest additions, give a quick overview\n" +
      "or full analysis, and some basic usage examples.\n" +
      "\n" +
      "Odoo module ES6-like syntax\n" +
      "Odoo 15 introduced a new way of defining our JavaScript module instead of the\n" +
      "usual odoo.define, we can now use a syntax similar to ES6 modu",
    reading_time: 18,
    access: true,
    comments: false,
    og_image: null,
    og_title: null,
    og_description: null,
    twitter_image: null,
    twitter_title: null,
    twitter_description: null,
    meta_title: "Odoo 15 JavaScript Reference: OWL Views, Services, Hooks, and WebClient.",
    meta_description:
      "Odoo 15 JavaScript Reference guide for OWL Views, the new WebClient, ES6 Modules, Hooks, Services registry, new Models, Layout Component, and more.",
    email_subject: null,
    feature_image_alt: "Odoo 15 JavaScript Reference: OWL Views, WebClient, Services, Hooks, and Models",
    feature_image_caption: null,
  };
  it("should generate front matter", async () => {
    const frontMatter = frontMatterGenerator(post);
    expect(frontMatter).toEqual(`---
title: 'Odoo 15 JavaScript Reference: OWL Views, WebClient, Services, and hooks.'
date: '2021-10-18T03:00:00.000+00:00'
tags:
  - Odoo 15
  - OWL
  - JavaScript
  - '#syntax-highlight'
status: published
feature_image: >-
  https://codingdodo.com/content/images/2021/10/post-cover-odoo-15-javascript-reference-5.png
canonical_url: https://codingdodo.com/odoo-15-javascript-reference
---
`);
  });
});
