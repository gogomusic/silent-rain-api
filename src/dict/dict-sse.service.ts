import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

/** 字典变更事件的载荷类型 */
export interface DictChangePayload {
  /** 变更的字典编码 */
  code: string;
  /** 变更后的字典项列表 */
  data?: { label: string; value: string; sort?: number }[];
}

/**
 * 字典 SSE 事件总线
 * —— 基于 RxJS Subject 的轻量级发布/订阅，用于将字典变更实时推送给所有 SSE 连接。
 */
@Injectable()
export class DictSseService {
  private readonly eventSubject = new Subject<MessageEvent>();

  /** 向所有已连接的 SSE 客户端广播字典变更事件 */
  emit(event: DictChangePayload): void {
    this.eventSubject.next({
      data: JSON.stringify(event),
    } as MessageEvent);
  }

  /** 获取 SSE 可观察流（Controller 中 @Sse() 使用） */
  getStream(): Observable<MessageEvent> {
    return this.eventSubject.asObservable();
  }
}
