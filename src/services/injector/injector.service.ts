import { performance, Performance } from 'perf_hooks';
import { Container, ContainerModule } from 'inversify';
import { Logger } from 'tslog';

import {
	AnagramsProgramService,
	IAnagramsProgramService,
} from '../anagrams-program/anagrams-program.service';
import { DictionaryService, IDictionaryService } from '../dictionary/dictionary.service';
import { FilesService, IFilesService } from '../files/files.service';
import { IInteractionService, InteractionService } from '../interaction/interaction.service';
import { ILoggerService, LoggerService } from '../logger/logger.service';
import { IPerformanceService, PerformanceService } from '../performance/performance.service';
import {
	IAnagramsProgramServiceKey,
	IConfigServiceKey,
	IDictionaryServiceKkey,
	IFilesServiceKey,
	IInteractionServiceKey,
	ILoggerServiceKey,
	IPerformanceServiceKey,
	LoggerKey,
	performanceKey,
} from './type-keys';
import { ConfigService, IConfigService } from '../config/config.service';

export class InjectorService {
	private static _container: Container;

	static get container(): Container {
		return this._container;
	}

	static set container(value: Container) {
		this._container = value;
	}

	static getContainer(): Container {
		if (!this._container) {
			this._container = new Container();

			this.configure();
		}

		return this._container;
	}

	private static configure(): void {
		const applicationDependencies = this.getApplicationDependencies();
		this._container.load(applicationDependencies);

		const configService = this._container.get<IConfigService>(IConfigServiceKey);
		const thirdPartyDependencies = this.getThirdPartyDependencies(configService);
		this._container.load(thirdPartyDependencies);
	}

	private static getApplicationDependencies(): ContainerModule {
		return new ContainerModule((bind) => {
			bind<IFilesService>(IFilesServiceKey).to(FilesService);
			bind<IDictionaryService>(IDictionaryServiceKkey).to(DictionaryService);
			bind<IInteractionService>(IInteractionServiceKey).to(InteractionService);
			bind<IAnagramsProgramService>(IAnagramsProgramServiceKey).to(AnagramsProgramService);
			bind<ILoggerService>(ILoggerServiceKey).to(LoggerService);
			bind<IPerformanceService>(IPerformanceServiceKey).to(PerformanceService);
			bind<IConfigService>(IConfigServiceKey).to(ConfigService);
		});
	}

	private static getThirdPartyDependencies(configService: IConfigService): ContainerModule {
		const logger = new Logger({
			displayFilePath: 'hidden',
			minLevel: configService.isProduction() ? 'info' : 'silly',
			...configService.getTSLogSettings(),
		});

		return new ContainerModule((bind) => {
			bind<Logger>(LoggerKey).toConstantValue(logger);
			bind<Performance>(performanceKey).toConstantValue(performance);
		});
	}
}
