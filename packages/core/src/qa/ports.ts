import type { PracticeVerdict, RetrievedPassage } from "./types.js";

export type MaterialSearchInput = {
	userId: string;
	materia: string;
	/** When set, the store must filter chunks to this unit only. */
	unidad?: string;
	question: string;
	questionEmbedding: number[];
};

export interface MaterialSearch {
	search(input: MaterialSearchInput): Promise<RetrievedPassage[]>;
}

export interface LlmProvider {
	answer(input: { question: string; passages: RetrievedPassage[] }): Promise<{
		stream: AsyncIterable<string>;
		citations: Array<{ filename: string; pagina: number }>;
	}>;
}

export type FailedPracticeQuestion = {
	question: string;
	unidad: string;
};

export type SaveFailedPracticeInput = {
	userId: string;
	materia: string;
	unidad: string;
	question: string;
};

export type ListFailedPracticeInput = {
	userId: string;
	materia: string;
};

export interface FailedPracticeStore {
	save(input: SaveFailedPracticeInput): Promise<void>;
	/** Must filter by `userId` and `materia` in the store. Callers do not trim the result. */
	list(input: ListFailedPracticeInput): Promise<FailedPracticeQuestion[]>;
}

export interface PracticeLlmProvider {
	generatePracticeQuestion(input: {
		passages: RetrievedPassage[];
	}): Promise<{ question: string }>;
	gradePracticeAnswer(input: {
		question: string;
		answer: string;
		passages: RetrievedPassage[];
	}): Promise<{ verdict: PracticeVerdict }>;
}
