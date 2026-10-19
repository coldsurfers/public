import type { DeployStorage } from './config'

export type S3StorageOptions = {
  bucket: string
  /** 생략하면 AWS SDK 기본(`AWS_REGION` · 프로필)을 따른다 */
  region?: string
}

/** optional peer 를 부를 때 연다 — `build` 만 쓰는 미니앱이 AWS SDK 를 물지 않게 */
async function loadS3() {
  try {
    return await import('@aws-sdk/client-s3')
  } catch (cause) {
    throw new Error('[react-native-mf] @aws-sdk/client-s3 를 찾을 수 없다. 미니앱에 설치한다.', {
      cause,
    })
  }
}

/**
 * S3 업로드처. 자격 증명은 AWS SDK 기본 체인(env · `~/.aws` 프로필)에서 읽는다.
 *
 * ⚠️ 버킷 `s3:ListBucket` 권한이 없으면 없는 키를 읽을 때 `NoSuchKey` 대신 `AccessDenied` 가
 * 온다. 그러면 첫 배포가 "없음" 을 못 알아보고 멈춘다.
 */
export function s3Storage(options: S3StorageOptions): DeployStorage {
  let connection: ReturnType<typeof connect> | undefined
  // 처음 쓸 때 연다. 만들 때 열면 SDK 가 없을 때 아무도 안 받는 rejection 으로 프로세스가 죽는다
  const connect = async () => {
    const sdk = await loadS3()
    return { sdk, client: new sdk.S3Client({ region: options.region }) }
  }
  const connected = () => {
    connection ??= connect()
    return connection
  }

  return {
    async read(key) {
      const { sdk, client } = await connected()
      const { GetObjectCommand, NoSuchKey } = sdk
      try {
        const response = await client.send(
          new GetObjectCommand({ Bucket: options.bucket, Key: key }),
        )
        return (await response.Body?.transformToString('utf8')) ?? ''
      } catch (error) {
        if (error instanceof NoSuchKey) return null
        throw error
      }
    },
    async write(key, body, meta) {
      const { sdk, client } = await connected()
      await client.send(
        new sdk.PutObjectCommand({
          Bucket: options.bucket,
          Key: key,
          Body: body,
          ContentType: meta.contentType,
          CacheControl: meta.cacheControl,
        }),
      )
    },
  }
}
