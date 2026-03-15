erDiagram

    REPORTS ||--o{ REPORT_ATTACHMENTS : has
    FILES ||--o{ REPORT_ATTACHMENTS : linked_to
    REPORTS ||--o{ ADMIN_FLAGS : flagged_by

    REPORTS {
        uuid id PK
        string public_tracking_code UK
        string type
        string title
        text description
        string location_text
        bigint selected_upazila_relation_id
        string upazila_name_snapshot
        bigint verified_upazila_relation_id
        decimal latitude
        decimal longitude
        string severity
        timestamp occurred_at
        string workflow_status
        string incident_status
        string reporter_name
        string political_party
        string suspect_name
        text other_people
        string news_article_url
        string video_evidence_url
        string audio_evidence_url
        text admin_note
        string reviewed_by_auth_user_id
        timestamp reviewed_at
        timestamp created_at
        timestamp updated_at
    }

    FILES {
        uuid id PK
        string storage_key
        string original_file_name
        string mime_type
        bigint size_bytes
        string upload_status
        timestamp created_at
    }

    REPORT_ATTACHMENTS {
        uuid id PK
        uuid report_id FK
        uuid file_id FK
        string attachment_type
        timestamp created_at
    }

    ADMIN_FLAGS {
        uuid id PK
        uuid report_id FK
        string tag
        text admin_note
        timestamp flagged_at
    }
