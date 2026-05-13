import { supabase } from './supabaseClient';

/**
 * Look up a family by matching any one guest's full_name (case-insensitive).
 * Returns: { family: {id, family_name}, guests: [...] } or null.
 */
export const findFamilyByGuestName = async (fullName) => {
  const name = (fullName || '').trim();
  if (!name) return null;

  // Case-insensitive exact match on full_name
  const { data: matches, error } = await supabase
    .from('guests')
    .select('id, family_id, full_name')
    .ilike('full_name', name)
    .limit(1);

  if (error) throw error;
  if (!matches || matches.length === 0) return null;

  const familyId = matches[0].family_id;

  const [familyRes, guestsRes] = await Promise.all([
    supabase.from('families').select('id, family_name').eq('id', familyId).single(),
    supabase
      .from('guests')
      .select(
        'id, family_id, full_name, email, church_attendance, reception_attendance, meal_preference, dietary_restrictions, rsvp_submitted_at'
      )
      .eq('family_id', familyId)
      .order('created_at', { ascending: true }),
  ]);

  if (familyRes.error) throw familyRes.error;
  if (guestsRes.error) throw guestsRes.error;

  return { family: familyRes.data, guests: guestsRes.data || [] };
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
      'id, family_name, address, created_at, guests(id, full_name, email, church_attendance, reception_attendance, meal_preference, dietary_restrictions, rsvp_submitted_at)'
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

export const addGuest = async (familyId, fullName, email = null) => {
  const { data, error } = await supabase
    .from('guests')
    .insert({ family_id: familyId, full_name: fullName, email })
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
