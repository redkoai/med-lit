import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeXmlEntities, parseJatsDocument, stripXml } from '../src/services/xmlUtils';

test('decodes XML entities and preserves readable text', () => {
  assert.equal(decodeXmlEntities('A &amp; B &#x2265; C'), 'A & B ≥ C');
  assert.equal(stripXml('<p>Risk &lt; 5%</p>'), 'Risk < 5%');
});

test('extracts JATS sections and the DOI-tagged identifier', () => {
  const xml = `<article><abstract><p>Abstract text long enough to be useful.</p></abstract><body>
    <sec><title>Methods</title><p>Participants were randomized using a concealed computer-generated sequence. Investigators documented enrollment and prespecified every primary outcome.</p></sec>
    <sec><title>Results</title><p>Outcomes were reported for nearly all randomized participants, with group-level estimates and uncertainty intervals presented for the primary comparison.</p></sec>
  </body><back><ref-list><ref><mixed-citation>Example citation</mixed-citation>
    <pub-id pub-id-type="pmid">123</pub-id><pub-id pub-id-type="doi">10.1000/test</pub-id>
  </ref></ref-list></back></article>`;
  const parsed = parseJatsDocument(xml);
  assert.match(parsed.fullText ?? '', /Participants were randomized/);
  assert.ok(parsed.availableSections.includes('methods'));
  assert.equal(parsed.references[0]?.doi, '10.1000/test');
  assert.equal(parsed.references[0]?.pmid, '123');
});
