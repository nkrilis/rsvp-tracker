import { supabase } from './supabaseClient';

const GUEST_FIELDS =
  'id, family_id, full_name, email, is_child, church_attendance, reception_attendance, meal_preference, dietary_restrictions, rsvp_submitted_at';

/**
 * Load a family and all its guests by family id.
 * Returns: { family: {id, family_name}, guests: [...] }.
 */
export const loadFamilyById = async (familyId) => {
  const [familyRes, guestsRes] = await Promise.all([
    supabase.from('families').select('id, family_name').eq('id', familyId).single(),
    supabase
      .from('guests')
      .select(GUEST_FIELDS)
      .eq('family_id', familyId)
      .order('created_at', { ascending: true }),
  ]);

  if (familyRes.error) throw familyRes.error;
  if (guestsRes.error) throw guestsRes.error;

  return { family: familyRes.data, guests: guestsRes.data || [] };
};

/**
 * Look up a family by matching a guest's full_name AND the family name
 * (both case-insensitive). Requiring both fields prevents collisions where
 * two households contain a guest with the same name, and adds a light
 * privacy gate so a name alone can't open another family's RSVP.
 *
 * Returns one of:
 *   { status: 'ok', result: { family, guests } }
 *   { status: 'not_found' }
 *   { status: 'ambiguous', candidates: [{ id, family_name, memberNames }] }
 *
 * `ambiguous` only happens in the rare case where multiple households share
 * both the same family name and a guest with the same name. The chooser
 * uses each household's member names to tell them apart.
 */
export const findFamily = async ({ fullName, familyName }) => {
  const name = (fullName || '').trim();
  const fam = (familyName || '').trim();
  if (!name || !fam) return { status: 'not_found' };

  // 1) Guests whose name matches (may span multiple families).
  const { data: matches, error } = await supabase
    .from('guests')
    .select('id, family_id, full_name')
    .ilike('full_name', name);
  if (error) throw error;
  if (!matches || matches.length === 0) return { status: 'not_found' };

  // 2) Narrow to the families whose name also matches.
  const familyIds = [...new Set(matches.map((m) => m.family_id))];
  const { data: families, error: famErr } = await supabase
    .from('families')
    .select('id, family_name')
    .in('id', familyIds)
    .ilike('family_name', fam);
  if (famErr) throw famErr;
  if (!families || families.length === 0) return { status: 'not_found' };

  // 3) Exactly one household → proceed.
  if (families.length === 1) {
    const result = await loadFamilyById(families[0].id);
    return { status: 'ok', result };
  }

  // 4) Still ambiguous → return candidates with member-name hints.
  const candidates = await Promise.all(
    families.map(async (f) => {
      const { data: gs } = await supabase
        .from('guests')
        .select('full_name')
        .eq('family_id', f.id)
        .order('created_at', { ascending: true });
      return {
        id: f.id,
        family_name: f.family_name,
        memberNames: (gs || []).map((g) => g.full_name),
      };
    })
  );
  return { status: 'ambiguous', candidates };
};

/**
 * Submit RSVP for every guest in a family.
 * `guests` is an array of { id, church_attendance, reception_attendance,
 * meal_preference, dietary_restrictions }.
 */
export const submitFamilyRSVP = async (guests) => {
  const now = new Date().toISOString();
  // Run updates in parallel
  const results = await Promise.all(
    guests.map((g) =>
      supabase
        .from('guests')
        .update({
          church_attendance: g.church_attendance || null,
          reception_attendance: g.reception_attendance || null,
          meal_preference:
            g.reception_attendance === 'Yes' ? g.meal_preference || null : null,
          dietary_restrictions:
            g.reception_attendance === 'Yes'
              ? g.dietary_restrictions || null
              : null,
          rsvp_submitted_at: now,
        })
        .eq('id', g.id)
    )
  );
  const firstError = results.find((r) => r.error);
  if (firstError) throw firstError.error;
  return true;
};

// ---------- Admin helpers ----------

export const listFamilies = async () => {
  const { data, error } = await supabase
    .from('families')
    .select(
      'id, family_name, address, created_at, guests(id, full_name, email, is_child, church_attendance, reception_attendance, meal_preference, dietary_restrictions, rsvp_submitted_at)'
    )
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const createFamily = async (familyName, address = null) => {
  const { data, error } = await supabase
    .from('families')
    .insert({ family_name: familyName, address })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateFamily = async (id, fields) => {
  const { error } = await supabase
    .from('families')
    .update(fields)
    .eq('id', id);
  if (error) throw error;
};

export const deleteFamily = async (id) => {
  const { error } = await supabase.from('families').delete().eq('id', id);
  if (error) throw error;
};

export const addGuest = async (familyId, fullName, isChild = false, email = null) => {
  const { data, error } = await supabase
    .from('guests')
    .insert({ family_id: familyId, full_name: fullName, is_child: isChild, email })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateGuest = async (id, fields) => {
  const { error } = await supabase.from('guests').update(fields).eq('id', id);
  if (error) throw error;
};

export const deleteGuest = async (id) => {
  const { error } = await supabase.from('guests').delete().eq('id', id);
  if (error) throw error;
};

// ---------- Admin auth ----------

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const getCurrentSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

export const onAuthChange = (callback) => {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription;
};
