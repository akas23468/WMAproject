import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('App loads splash screen title smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const CampusLostFoundApp());
    expect(find.text('Campus Lost & Found'), findsOneWidget);
    expect(find.text('Find it. Report it. Return it.'), findsOneWidget);
  });
}
