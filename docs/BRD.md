# Business Requirements Document --- Project Notebook

**Status:** MVP proposal\
**Platform:** Chrome extension\
**Audience:** Individual developers and technically inclined users

## 1. Problem

Important project links and explanations are scattered across documents,
spreadsheets, bookmarks, and notes. A URL alone does not explain why it
matters or where it belongs. Finding resources later can require opening
documents, searching, or scrolling.

## 2. Vision

A lightweight, document-first browser notebook where users organize
project notes and links, capture pages quickly, and retrieve resources
later.

## 3. Goals

-   Reduce friction when recording useful webpages.
-   Keep links and explanatory context together.
-   Organize resources by project.
-   Search saved notes and links.
-   Keep data private and usable without an account.

## 4. Non-goals

Google Docs replacement or integration; cloud sync; accounts;
collaboration; password/secrets management; AI; reminders; task
management; full knowledge-management suite.

## 5. Primary use cases

1.  Create a notebook for a project.
2.  Write notes with headings and bullets.
3.  Add links with titles and optional descriptions.
4.  Capture the active page into a notebook.
5.  Search for saved resources later.
6.  Export/import a backup.

## 6. Functional requirements

  ----------------------------------------------------------------------------
  ID                      Requirement                  Priority
  ----------------------- ---------------------------- -----------------------
  FR-01                   Create, rename, delete       Must
                          notebooks                    

  FR-02                   Edit headings (H1--H3),      Must
                          paragraphs, bullets, and     
                          links                        

  FR-03                   Autosave locally             Must

  FR-04                   Capture active-tab title and Must
                          URL after explicit user      
                          action                       

  FR-05                   Select notebook and          Must
                          optionally edit              
                          title/URL/description        

  FR-06                   Search notebook titles and   Must
                          all supported text blocks    

  FR-07                   Open saved links in a        Must
                          browser tab                  

  FR-08                   Export versioned JSON        Must

  FR-09                   Import validated JSON with   Must
                          explicit conflict behavior   

  FR-10                   No backend or transmission   Must
                          of notebook content          

  FR-11                   Basic keyboard accessibility Must
                          and visible focus            

  FR-12                   Clear                        Must
                          save/capture/import/export   
                          feedback                     
  ----------------------------------------------------------------------------

## 7. Non-functional requirements

-   **Privacy:** local-only; no telemetry in MVP.
-   **Security:** no secret-storage feature; validate imported content
    and URLs.
-   **Reliability:** data survives browser restart; save failures are
    visible.
-   **Usability:** capture requires few interactions; use last notebook
    by default when possible.
-   **Portability:** documented export/restore format.
-   **Maintainability:** versioned schema, small modules, automated
    tests, minimal dependencies.

## 8. Success criteria

Pilot with a small group of individual developers. Confirm users can
create/edit a notebook, capture a page, find it via search, and
export/import data without help. Look for repeated use and evidence that
it replaces or complements an existing scattered-document workflow.
Installs alone do not establish product-market fit.

## 9. Risks

-   **Crowded category:** validate document-first project capture as the
    differentiator.
-   **Editor complexity:** use a mature editor and limit block types.
-   **Data loss:** autosave, schema versioning, export/import, tests.
-   **Sensitive text pasted by users:** clearly state this is not a
    secrets manager.
-   **Permission distrust:** least privilege and plain-language
    explanations.

## 10. MVP boundary

Single-user Chrome extension with local notebook editing, page capture,
search, and JSON backup/restore. No accounts, sync, backend, Google
integration, or collaboration.
