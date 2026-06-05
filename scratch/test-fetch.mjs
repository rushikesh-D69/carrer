import fetch from 'node-fetch';

const url = 'https://gkfkgzbvnoxjxxmrjgot.supabase.co/rest/v1/user_roles?select=*';
const anonKey = 'sb_publishable_2gW-fqHpiVNd_isBBAc8mQ_uTtLRakF';

async function test() {
  const res = await fetch(url, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    }
  });
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}

test();
