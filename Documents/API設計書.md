# カレンダーアプリ API設計書

## 概要
本API設計書は、カレンダーアプリケーションのフロントエンドとバックエンド間のデータ連携を定義します。イベントの作成、読み取り、更新、削除（CRUD）操作をサポートします。

## ベースURL
`/api/v1` (例: `https://yourdomain.com/api/v1`)

## データ形式
リクエストおよびレスポンスのデータ形式はすべてJSONとします。

## エラーハンドリング
APIリクエストでエラーが発生した場合、以下の形式でエラーレスポンスを返します。

```json
{
  "error": {
    "code": "エラーコード (例: INVALID_INPUT, NOT_FOUND)",
    "message": "エラーメッセージの詳細"
  }
}
```

### HTTPステータスコード
*   `200 OK`: リクエストが成功し、期待されるレスポンスが返された場合。
*   `201 Created`: リソースが正常に作成された場合。
*   `204 No Content`: リクエストが成功し、レスポンスボディがない場合（例: 削除成功）。
*   `400 Bad Request`: リクエストの形式が不正、または必須パラメータが不足している場合。
*   `404 Not Found`: 指定されたリソースが見つからない場合。
*   `500 Internal Server Error`: サーバー内部で予期せぬエラーが発生した場合。

## エンドポイント一覧

### 1. イベントの取得 (GET /events)

#### 説明
登録されているすべてのイベント、または指定された期間のイベントを取得します。

#### リクエスト
*   **メソッド**: `GET`
*   **パス**: `/events`
*   **クエリパラメータ (オプション)**:
    *   `start_date`: 取得開始日 (YYYY-MM-DD形式)
    *   `end_date`: 取得終了日 (YYYY-MM-DD形式)

#### レスポンス (200 OK)
```json
[
  {
    "id": 1,
    "event_date": "2025-07-29",
    "content": "会議",
    "created_at": "2025-07-29T10:00:00Z",
    "updated_at": "2025-07-29T10:00:00Z"
  },
  {
    "id": 2,
    "event_date": "2025-08-15",
    "content": "休暇",
    "created_at": "2025-07-20T15:30:00Z",
    "updated_at": "2025-07-20T15:30:00Z"
  }
]
```

### 2. 新規イベントの作成 (POST /events)

#### 説明
新しいイベントを作成します。`event_date`はユニークである必要があります。

#### リクエスト
*   **メソッド**: `POST`
*   **パス**: `/events`
*   **ヘッダー**: `Content-Type: application/json`
*   **ボディ**:
```json
{
  "event_date": "2025-09-01",
  "content": "プロジェクト開始"
}
```

#### レスポンス (201 Created)
```json
{
  "id": 3,
  "event_date": "2025-09-01",
  "content": "プロジェクト開始",
  "created_at": "2025-07-29T11:00:00Z",
  "updated_at": "2025-07-29T11:00:00Z"
}
```

#### エラー例 (400 Bad Request)
`event_date`が既に存在する場合:
```json
{
  "error": {
    "code": "DUPLICATE_ENTRY",
    "message": "Event for 2025-09-01 already exists."
  }
}
```

### 3. 特定イベントの取得 (GET /events/{id})

#### 説明
指定されたIDのイベントを取得します。

#### リクエスト
*   **メソッド**: `GET`
*   **パス**: `/events/{id}` (例: `/events/1`)

#### レスポンス (200 OK)
```json
{
  "id": 1,
  "event_date": "2025-07-29",
  "content": "会議",
  "created_at": "2025-07-29T10:00:00Z",
  "updated_at": "2025-07-29T10:00:00Z"
}
```

#### エラー例 (404 Not Found)
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Event with ID 999 not found."
  }
}
```

### 4. 特定イベントの取得 (GET /events/by-date/{date})

#### 説明
指定された日付のイベントを取得します。

#### リクエスト
*   **メソッド**: `GET`
*   **パス**: `/events/by-date/{date}` (例: `/events/by-date/2025-07-29`)

#### レスポンス (200 OK)
```json
{
  "id": 1,
  "event_date": "2025-07-29",
  "content": "会議",
  "created_at": "2025-07-29T10:00:00Z",
  "updated_at": "2025-07-29T10:00:00Z"
}
```

#### エラー例 (404 Not Found)
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Event for date 2025-07-29 not found."
  }
}
```

### 5. 特定イベントの更新 (PUT /events/{id})

#### 説明
指定されたIDのイベントを更新します。

#### リクエスト
*   **メソッド**: `PUT`
*   **パス**: `/events/{id}` (例: `/events/1`)
*   **ヘッダー**: `Content-Type: application/json`
*   **ボディ**:
```json
{
  "content": "重要な会議"
}
```

#### レスポンス (200 OK)
```json
{
  "id": 1,
  "event_date": "2025-07-29",
  "content": "重要な会議",
  "created_at": "2025-07-29T10:00:00Z",
  "updated_at": "2025-07-29T11:30:00Z"
}
```

#### エラー例 (404 Not Found)
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Event with ID 999 not found."
  }
}
```

### 6. 特定イベントの削除 (DELETE /events/{id})

#### 説明
指定されたIDのイベントを削除します。

#### リクエスト
*   **メソッド**: `DELETE`
*   **パス**: `/events/{id}` (例: `/events/1`)

#### レスポンス (204 No Content)
レスポンスボディはありません。

#### エラー例 (404 Not Found)
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Event with ID 999 not found."
  }
}
```