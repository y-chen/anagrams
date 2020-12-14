import { injectable } from 'inversify';

import { environment } from '@anagrams/environment';
import { TSLogSettings } from '@anagrams/models';

import { IConfigService } from '../interfaces/config.interface';

@injectable()
export class ConfigService implements IConfigService {
	private readonly environment;

	constructor() {
		this.environment = environment;
	}

	isProduction(): boolean {
		return this.environment.production;
	}

	getDictionaryPath(): string {
		return this.environment.dictionaryPath;
	}

	getLogsPath(): string {
		return this.environment.logger.logsPath;
	}

	getTSLogSettings(): TSLogSettings {
		return this.environment.logger.tsLogSettings;
	}
}
