import 'reflect-metadata';
import { mock, mockReset, MockProxy } from 'jest-mock-extended';

import { formatResults } from '@anagrams/utils';

import { IAnagramsProgramService } from './anagrams-program.service';
import { IInteractionService } from '../interaction/interaction.service';
import { IDictionaryService } from '../dictionary/dictionary.service';
import { InjectorService } from '../injector/injector.service';
import { askForTermQuestion, initQuestions, newSearchQuestion } from './program-questions';
import { closingCommand, matchNotFoundCommand } from './program-commands';

describe('AnagramsProgramService', () => {
	let sut: IAnagramsProgramService;
	let interactionServiceMock: MockProxy<IInteractionService>;
	let dictionaryServiceMock: MockProxy<IDictionaryService>;

	const container = InjectorService.getContainer();

	beforeEach(() => {
		interactionServiceMock = mock<IInteractionService>();
		dictionaryServiceMock = mock<IDictionaryService>();

		container
			.rebind<IInteractionService>('InteractionService')
			.toConstantValue(interactionServiceMock);
		container
			.rebind<IDictionaryService>('DictionaryService')
			.toConstantValue(dictionaryServiceMock);

		sut = container.get<IAnagramsProgramService>('AnagramsProgramService');
	});

	describe('init', () => {
		it('should call dictionary.read with expected parameter', async () => {
			const filePath = 'file/path.txt';
			const initAnswers = { caseSensitive: true, matchAllChars: true };
			interactionServiceMock.ask.calledWith(initQuestions).mockResolvedValue(initAnswers);

			await sut.init(filePath);

			expect(dictionaryServiceMock.read).toHaveBeenCalledWith(filePath);
		});

		it('should set searchOptions from init answers as expected', async () => {
			const filePath = 'file/path.txt';
			const initAnswers = { caseSensitive: false, matchAllChars: true };
			interactionServiceMock.ask.calledWith(initQuestions).mockResolvedValue(initAnswers);

			await sut.init(filePath);

			expect(sut.searchOptions).toEqual(initAnswers);
		});
	});

	describe('run', () => {
		it('should read search term and pass it to dictionary.search as expected ', async () => {
			const termAnswer = { term: 'abc' };
			const newSearchAnswer = { doNewSearch: false };
			interactionServiceMock.ask
				.calledWith(askForTermQuestion as any)
				.mockResolvedValue(termAnswer);
			interactionServiceMock.ask
				.calledWith(newSearchQuestion as any)
				.mockResolvedValue(newSearchAnswer);

			await sut.run();

			expect(dictionaryServiceMock.search).toHaveBeenCalledWith(termAnswer.term, sut.searchOptions);
		});

		it('should print results as expected when matches are found', async () => {
			const searchResults = ['abc', 'abc'];
			const termAnswer = { term: 'abc' };
			const newSearchAnswer = { doNewSearch: false };
			interactionServiceMock.ask
				.calledWith(askForTermQuestion as any)
				.mockResolvedValue(termAnswer);
			interactionServiceMock.ask
				.calledWith(newSearchQuestion as any)
				.mockResolvedValue(newSearchAnswer);
			dictionaryServiceMock.search
				.calledWith(termAnswer.term, sut.searchOptions)
				.mockResolvedValue(searchResults);
			const expectedResultsCommand = formatResults(searchResults);

			await sut.run();

			expect(interactionServiceMock.say).toHaveBeenCalledWith(expectedResultsCommand);
		});

		it('should display match not found message when dictionary.search does not return items', async () => {
			const searchResults: string[] = [];
			const termAnswer = { term: 'abc' };
			const newSearchAnswer = { doNewSearch: false };
			interactionServiceMock.ask
				.calledWith(askForTermQuestion as any)
				.mockResolvedValue(termAnswer);
			interactionServiceMock.ask
				.calledWith(newSearchQuestion as any)
				.mockResolvedValue(newSearchAnswer);
			dictionaryServiceMock.search
				.calledWith(termAnswer.term, sut.searchOptions)
				.mockResolvedValue(searchResults);

			await sut.run();

			expect(interactionServiceMock.say).toHaveBeenCalledWith(matchNotFoundCommand);
		});

		it('should handle quit command correctly and display closing command as expected', async () => {
			const searchResults: string[] = [];
			const termAnswer = { term: 'abc' };
			const newSearchAnswer = { doNewSearch: false };
			interactionServiceMock.ask
				.calledWith(askForTermQuestion as any)
				.mockResolvedValue(termAnswer);
			interactionServiceMock.ask
				.calledWith(newSearchQuestion as any)
				.mockResolvedValue(newSearchAnswer);
			dictionaryServiceMock.search
				.calledWith(termAnswer.term, sut.searchOptions)
				.mockResolvedValue(searchResults);

			await sut.run();

			expect(sut.continue).toEqual(newSearchAnswer.doNewSearch);
			expect(interactionServiceMock.say).lastCalledWith(closingCommand);
		});
	});

	afterEach(() => {
		mockReset(interactionServiceMock);
		mockReset(dictionaryServiceMock);
	});
});
