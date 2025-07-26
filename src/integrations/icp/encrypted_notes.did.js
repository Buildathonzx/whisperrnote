export const idlFactory = ({ IDL }) => {
  const EncryptedNote = IDL.Record({
    'id' : IDL.Nat,
    'status' : IDL.Opt(IDL.Text),
    'is_public' : IDL.Opt(IDL.Bool),
    'title' : IDL.Opt(IDL.Text),
    'updated_at' : IDL.Opt(IDL.Text),
    'encrypted_text' : IDL.Text,
    'content' : IDL.Opt(IDL.Text),
    'owner' : IDL.Text,
    'metadata' : IDL.Opt(IDL.Text),
    'tags' : IDL.Opt(IDL.Vec(IDL.Text)),
    'created_at' : IDL.Opt(IDL.Text),
    'user_id' : IDL.Opt(IDL.Text),
    'parent_note_id' : IDL.Opt(IDL.Text),
    'extensions' : IDL.Opt(IDL.Vec(IDL.Text)),
    'collaborators' : IDL.Opt(IDL.Vec(IDL.Text)),
    'users' : IDL.Vec(IDL.Text),
    'comments' : IDL.Opt(IDL.Vec(IDL.Text)),
    'attachments' : IDL.Opt(IDL.Vec(IDL.Text)),
  });
  const anon_class_15_1 = IDL.Service({
    'add_user' : IDL.Func([IDL.Nat, IDL.Text], [], []),
    'create_note' : IDL.Func([], [IDL.Nat], []),
    'delete_note' : IDL.Func([IDL.Nat], [], []),
    'encrypted_symmetric_key_for_note' : IDL.Func(
        [IDL.Nat, IDL.Vec(IDL.Nat8)],
        [IDL.Text],
        [],
      ),
    'get_notes' : IDL.Func([], [IDL.Vec(EncryptedNote)], []),
    'remove_user' : IDL.Func([IDL.Nat, IDL.Text], [], []),
    'symmetric_key_verification_key_for_note' : IDL.Func([], [IDL.Text], []),
    'update_note' : IDL.Func(
        [
          IDL.Nat,
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Vec(IDL.Text)),
          IDL.Opt(IDL.Vec(IDL.Text)),
          IDL.Opt(IDL.Vec(IDL.Text)),
          IDL.Opt(IDL.Vec(IDL.Text)),
          IDL.Opt(IDL.Vec(IDL.Text)),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Bool),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
        ],
        [],
        [],
      ),
    'whoami' : IDL.Func([], [IDL.Text], []),
  });
  return anon_class_15_1;
};
export const init = ({ IDL }) => { return []; };
