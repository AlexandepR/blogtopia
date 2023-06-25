// const configModule = getConfigModule;
// const configModule = configModule;
import { Module } from "@nestjs/common";
import { controllers, moduleImports, queryRepo, repo, services, useCases } from "./use-cases";


@Module({
  imports: [...moduleImports],
  controllers: [...controllers],
  providers: [...services, ...repo, ...queryRepo, ...useCases,]
})
export class AppModule {
}