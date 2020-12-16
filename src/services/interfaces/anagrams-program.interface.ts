import { SearchOptions } from '@anagrams/models';

export interface IAnagramsProgramService {
	searchOptions: SearchOptions;
	continue: boolean;

	init(): Promise<void>;
	run(): Promise<void>;
}
