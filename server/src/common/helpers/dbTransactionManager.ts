import { EntityManager, Repository } from 'typeorm';

export function transactionManagerWrapper<TModel>(
  transactionManager: EntityManager | undefined,
  repo: Repository<any>,
  fn: (manager: EntityManager) => Promise<TModel>,
) {
  const manager = transactionManager || repo.manager;

  if (manager.queryRunner?.isTransactionActive) {
    return fn(manager);
  }

  return manager.transaction(fn);
}
