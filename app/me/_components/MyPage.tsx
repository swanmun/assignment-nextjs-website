"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, SquareUser } from "lucide-react";
import { Button } from "@/components/button/Button";
import { Empty } from "@/components/empty/Empty";
import { Fieldset } from "@/components/fieldset/Fieldset";
import { Icon } from "@/components/icon/Icon";
import { Modal } from "@/components/modal/Modal";
import { Note } from "@/components/note/Note";
import { TextField } from "@/components/text-field/TextField";
import { StatusBar, ViewToggle, Window, WindowWell, type ListView } from "@/components/window/Window";
import {
  NICKNAME_MAX,
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_TYPES,
  PROFILE_IMAGE_UPLOAD_BYTES,
  PROFILE_IMAGE_UPLOAD_SIDE,
  validateNickname,
} from "@/lib/profile-rules";
import { requestJson } from "@/lib/request-json";
import { shrinkImage } from "@/lib/shrink-image";
import type { Place, User } from "@/lib/types";
import page from "../../_components/page.module.css";
import { RestaurantGrid } from "../../_components/RestaurantGrid";
import { useFlashToast } from "../../_components/useFlashToast";
import styles from "../me.module.css";

type MyPageProps = {
  user: User;
  posts: Place[];
};

export const MyPage = ({ user, posts: initialPosts }: MyPageProps) => {
  const router = useRouter();
  const { show, toast } = useFlashToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [nickname, setNickname] = useState(user.nickname);
  const [savedNickname, setSavedNickname] = useState(user.nickname);
  const [view, setView] = useState<ListView>("list");
  const [savingNickname, setSavingNickname] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  /** X를 눌러 삭제 확인 중인 글 */
  const [confirming, setConfirming] = useState<Place | null>(null);
  const [removingId, setRemovingId] = useState<string>();

  const trimmed = nickname.trim();
  const nicknameError = validateNickname(nickname);
  const canSave = !nicknameError && trimmed !== savedNickname && !savingNickname;

  const saveNickname = async () => {
    if (!canSave) return;
    setSavingNickname(true);
    try {
      const result = await requestJson<{ nickname: string }>(
        "/api/profile",
        { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nickname: trimmed }) },
        "닉네임을 바꾸지 못했어요.",
      );
      setSavedNickname(result.nickname);
      setNickname(result.nickname);
      show("success", "닉네임을 바꿨어요.");
    } catch (error) {
      show("error", (error as Error).message);
    } finally {
      setSavingNickname(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!(PROFILE_IMAGE_TYPES as readonly string[]).includes(file.type)) return show("error", "PNG·JPG 사진만 올릴 수 있어요.");
    if (file.size > PROFILE_IMAGE_MAX_BYTES) return show("error", "5MB 이하 사진만 올릴 수 있어요.");

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", await shrinkImage(file, { maxSide: PROFILE_IMAGE_UPLOAD_SIDE, maxBytes: PROFILE_IMAGE_UPLOAD_BYTES }));
      const result = await requestJson<{ avatarUrl: string }>(
        "/api/profile/image",
        { method: "POST", body: formData },
        "사진을 바꾸지 못했어요.",
      );
      setAvatarUrl(result.avatarUrl);
      show("success", "프로필 사진을 바꿨어요.");
    } catch (error) {
      show("error", (error as Error).message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  /** BFF(DELETE /api/places/:id)가 소프트삭제한다. 성공하면 목록에서 바로 뺀다. */
  const removePost = async (post: Place) => {
    setRemovingId(post.id);
    try {
      await requestJson(`/api/places/${post.id}`, { method: "DELETE" }, "글을 삭제하지 못했어요.");
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setConfirming(null);
      show("success", "글을 삭제했어요.");
    } catch (error) {
      show("error", (error as Error).message);
    } finally {
      setRemovingId(undefined);
    }
  };

  return (
    <>
      {toast}
      <Window title="C:\구로\내 정보" icon={<SquareUser size={14} />} minimizable>
        <div className={page.windowContent}>
          <div className={styles.profileLayout}>
            <div className={styles.profileRow}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 스토리지·구글 사진 URL을 그대로 보여준다 */}
              <img src={avatarUrl} alt={`${savedNickname} 프로필 사진`} className={styles.avatar} />
              <div className={styles.profileInfo}>
                <div className={styles.nameBlock}>
                  <h2 className="typo-heading-md">{savedNickname}</h2>
                  <span className={`${styles.email} typo-label-md`}>{user.email}</span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon="image"
                  loading={uploadingAvatar}
                  disabled={uploadingAvatar}
                  onClick={() => fileRef.current?.click()}
                >
                  사진 바꾸기
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) uploadAvatar(file);
                  }}
                />
              </div>
            </div>
            <Fieldset legend="닉네임 바꾸기" compact>
              <form
                className={styles.nicknameRow}
                onSubmit={(event) => {
                  event.preventDefault();
                  saveNickname();
                }}
              >
                <TextField
                  label="닉네임"
                  hideLabel
                  leftIcon="user"
                  value={nickname}
                  maxLength={NICKNAME_MAX + 4}
                  error={nicknameError}
                  onChange={(event) => setNickname(event.target.value)}
                  rightAdornment={
                    nickname && (
                      <button type="button" className={styles.clear} aria-label="닉네임 지우기" onClick={() => setNickname("")}>
                        <Icon name="close" size={20} />
                      </button>
                    )
                  }
                  className={styles.nicknameField}
                />
                <Button type="submit" variant="secondary" loading={savingNickname} disabled={!canSave}>
                  저장
                </Button>
              </form>
              {!nicknameError && <Note>2~12자 · 바꾸면 내가 쓴 모든 글에도 함께 바뀌어요</Note>}
            </Fieldset>
          </div>
          <StatusBar items={[`등록한 맛집 ${posts.length}곳`, `${user.joinedAt} 가입`]} />
        </div>
      </Window>

      <Window
        title="C:\구로\내가 쓴 맛집"
        icon={<FolderOpen size={14} />}
        minimizable
        toolbar={
          <>
            <span className="typo-label-md">
              내가 쓴 글 {posts.length}곳{posts.length > 0 && " · 최신순"}
            </span>
            <ViewToggle value={view} onChange={setView} />
          </>
        }
        status={[`${posts.length} / ${posts.length} 표시`, `작성자: ${savedNickname}`]}
      >
        <WindowWell>
          {posts.length === 0 ? (
            <Empty
              visual="edit"
              title="아직 등록한 맛집이 없어요"
              description="내가 찾은 숨은 맛집을 이웃에게 처음으로 소개해 보세요."
              primaryAction={{ label: "맛집 쓰기", leftIcon: "edit", onClick: () => router.push("/restaurants/new") }}
            />
          ) : (
            <>
              <RestaurantGrid restaurants={posts} view={view} onRemove={setConfirming} removingId={removingId} />
              <p className={`${page.listFooter} typo-label-md`}>
                <Icon name="check" size={16} />
                마지막 맛집이에요
              </p>
            </>
          )}
        </WindowWell>
      </Window>

      <Modal
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        title="글을 삭제할까요?"
        secondaryAction={{ label: "취소", onClick: () => setConfirming(null) }}
        primaryAction={{
          label: "삭제하기",
          loading: removingId !== undefined,
          disabled: removingId !== undefined,
          onClick: () => confirming && removePost(confirming),
        }}
      >
        {confirming && `'${confirming.name}' 글을 삭제하면 목록과 상세에서 더 이상 보이지 않아요.`}
      </Modal>

      <form action="/api/auth/signout" method="post">
        <Button type="submit" variant="secondary" leftIcon="logout" className={page.fullWidth}>
          로그아웃
        </Button>
      </form>
    </>
  );
};
