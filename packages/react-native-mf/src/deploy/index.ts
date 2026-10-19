/**
 * 배포 레인 — 빌드 머신(Node)에서 `react-native-mf.config.ts` 가 import 한다.
 *
 * `@aws-sdk/client-s3` 는 optional peer 다. `s3Storage` 를 실제로 쓸 때만 연다.
 */

export type { DeployBuildConfig, DeployConfig, DeployStorage } from './config'
export { defineConfig } from './config'
export type { S3StorageOptions } from './s3'
export { s3Storage } from './s3'
