export interface JiraUser {
  displayName: string;
  emailAddress?: string;
}

export interface JiraCommentRaw {
  id: string;
}

export interface JiraIssueFields {
  summary: string;
  status: { name: string };
  assignee?: JiraUser | null;
  reporter?: JiraUser | null;
  comment?: { comments: JiraCommentRaw[] };
}

export interface JiraRenderedComment {
  id: string;
  body: string;
}

export interface JiraIssueResponse {
  id: string;
  key: string;
  fields: JiraIssueFields;
  renderedFields?: {
    description?: string;
    comment?: { comments: JiraRenderedComment[] };
  };
}

export interface ExtractedIds {
  accountId?: string;
  projectId?: string;
}

export interface JiraIssueSummary {
  key: string;
  url: string;
  summary: string;
  status: string;
  descriptionText: string;
  commentsText: string;
  extractedIds: ExtractedIds;
}
