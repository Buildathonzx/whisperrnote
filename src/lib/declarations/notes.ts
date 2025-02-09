import { IDL } from '@dfinity/candid';

export const idlFactory = ({ IDL }: { IDL: typeof IDL }) => {
  const Note = IDL.Record({
    id: IDL.Text,
    owner: IDL.Text,
    encrypted_content: IDL.Vec(IDL.Nat8),
    shared_with: IDL.Vec(IDL.Text),
    created_at: IDL.Nat64,
    updated_at: IDL.Nat64,
  });
  const SharedKey = IDL.Record({
    note_id: IDL.Text,
    recipient: IDL.Text,
    encrypted_key: IDL.Vec(IDL.Nat8),
  });
  const Error = IDL.Variant({
    NotFound: IDL.Null,
    NotAuthorized: IDL.Null,
    AlreadyExists: IDL.Null,
  });
  const Result = IDL.Variant({ Ok: IDL.Null, Err: Error });
  const ResultNote = IDL.Variant({ Ok: Note, Err: Error });
  const ResultNotes = IDL.Variant({ Ok: IDL.Vec(Note), Err: Error });
  const ResultOptBytes = IDL.Variant({ Ok: IDL.Opt(IDL.Vec(IDL.Nat8)), Err: Error });
  return IDL.Service({
    create_note: IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8)], [Result], []),
    update_note: IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8)], [Result], []),
    get_note: IDL.Func([IDL.Text], [ResultNote], ['query']),
    list_notes: IDL.Func([], [ResultNotes], ['query']),
    share_note: IDL.Func([IDL.Text, IDL.Text, IDL.Vec(IDL.Nat8)], [Result], []),
    get_shared_key: IDL.Func([IDL.Text], [ResultOptBytes], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };
