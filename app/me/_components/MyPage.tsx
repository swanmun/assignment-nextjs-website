"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, SquareUser } from "lucide-react";
import { Button } from "@/components/button/Button";
import { Empty } from "@/components/empty/Empty";
import { Fieldset } from "@/components/fieldset/Fieldset";
import { Icon } from "@/components/icon/Icon";
import { Note } from "@/components/note/Note";
import { TextField } from "@/components/text-field/TextField";
import { StatusBar, ViewToggle, Window, WindowWell, type ListView } from "@/components/window/Window";
import type { Restaurant, User } from "@/lib/mock-data";
import page from "../../_components/page.module.css";
import { RestaurantGrid } from "../../_components/RestaurantGrid";
import { useFlashToast } from "../../_components/useFlashToast";
import styles from "../me.module.css";

const NICKNAME_MIN = 2;
const NICKNAME_MAX = 12;

type MyPageProps = {
  user: User;
  posts: Restaurant[];
};

export const MyPage = ({ user, posts }: MyPageProps) => {
  const router = useRouter();
  const { show, toast } = useFlashToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [nickname, setNickname] = useState(user.nickname);
  const [savedNickname, setSavedNickname] = useState(user.nickname);
  const [view, setView] = useState<ListView>("list");

  const trimmed = nickname.trim();
  const nicknameError =
    trimmed.length < NICKNAME_MIN || trimmed.length > NICKNAME_MAX ? `${NICKNAME_MIN}~${NICKNAME_MAX}자로 입력해 주세요.` : undefined;
  const canSave = !nicknameError && trimmed !== savedNickname;

  const saveNickname = () => {
    if (!canSave) return;
    setSavedNickname(trimmed);
    show("success", "닉네임을 바꿨어요.");
  };

  return (
    <>
      {toast}
      <Window title="C:\구로\내 정보" icon={<SquareUser size={14} />} minimizable>
        <div className={page.windowContent}>
          <div className={styles.profileLayout}>
            <div className={styles.profileRow}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 업로드 미리보기(blob URL)도 그대로 보여준다 */}
              <img src={avatarUrl} alt={`${savedNickname} 프로필 사진`} className={styles.avatar} />
              <div className={styles.profileInfo}>
                <div className={styles.nameBlock}>
                  <h2 className="typo-heading-md">{savedNickname}</h2>
                  <span className={`${styles.email} typo-label-md`}>{user.email}</span>
                </div>
                <Button variant="secondary" size="sm" leftIcon="image" onClick={() => fileRef.current?.click()}>
                  사진 바꾸기
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) setAvatarUrl(URL.createObjectURL(file));
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
                <Button type="submit" variant="secondary" disabled={!canSave}>
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
              <RestaurantGrid restaurants={posts} view={view} />
              <p className={`${page.listFooter} typo-label-md`}>
                <Icon name="check" size={16} />
                마지막 맛집이에요
              </p>
            </>
          )}
        </WindowWell>
      </Window>

      <Button variant="secondary" leftIcon="logout" className={page.fullWidth} onClick={() => router.push("/login")}>
        로그아웃
      </Button>
    </>
  );
};
