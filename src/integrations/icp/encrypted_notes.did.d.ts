import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface EncryptedNote {
  'id' : bigint,
  'status' : [] | [string],
  'is_public' : [] | [boolean],
  'title' : [] | [string],
  'updated_at' : [] | [string],
  'encrypted_text' : string,
  'content' : [] | [string],
  'owner' : string,
  'metadata' : [] | [string],
  'tags' : [] | [Array<string>],
  'created_at' : [] | [string],
  'user_id' : [] | [string],
  'parent_note_id' : [] | [string],
  'extensions' : [] | [Array<string>],
  'collaborators' : [] | [Array<string>],
  'users' : Array<string>,
  'comments' : [] | [Array<string>],
  'attachments' : [] | [Array<string>],
}
export interface anon_class_15_1 {
  'add_user' : ActorMethod<[bigint, string], undefined>,
  'create_note' : ActorMethod<[], bigint>,
  'delete_note' : ActorMethod<[bigint], undefined>,
  'encrypted_symmetric_key_for_note' : ActorMethod<
    [bigint, Uint8Array | number[]],
    string
  >,
  'get_notes' : ActorMethod<[], Array<EncryptedNote>>,
  'remove_user' : ActorMethod<[bigint, string], undefined>,
  'symmetric_key_verification_key_for_note' : ActorMethod<[], string>,
  'update_note' : ActorMethod<
    [
      bigint,
      string,
      [] | [string],
      [] | [string],
      [] | [Array<string>],
      [] | [Array<string>],
      [] | [Array<string>],
      [] | [Array<string>],
      [] | [Array<string>],
      [] | [string],
      [] | [boolean],
      [] | [string],
      [] | [string],
    ],
    undefined
  >,
  'whoami' : ActorMethod<[], string>,
}
export interface _SERVICE extends anon_class_15_1 {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
